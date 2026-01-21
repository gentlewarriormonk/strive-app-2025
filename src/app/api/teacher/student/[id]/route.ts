import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a teacher
    const teacher = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!teacher || teacher.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Only teachers can access student data' }, { status: 403 });
    }

    const { id: studentId } = await params;
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    // Get student data
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        xp: true,
        level: true,
        role: true,
      },
    });

    if (!student || student.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Verify teacher has access to this student (through a group)
    const membership = await prisma.groupMembership.findFirst({
      where: {
        userId: studentId,
        group: {
          teacherId: session.user.id,
          ...(groupId ? { id: groupId } : {}),
        },
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get today's date for calculations
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get start of week (Monday)
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    // Get student's habits with completions
    const habits = await prisma.habit.findMany({
      where: {
        userId: studentId,
        isActive: true,
      },
      include: {
        completions: {
          where: {
            date: {
              gte: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
          orderBy: { date: 'desc' },
        },
      },
    });

    // Calculate stats for each habit
    const habitsWithStats = habits.map((habit) => {
      const completionDates = habit.completions.map((c) => {
        const d = new Date(c.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      });

      // Calculate current streak
      let currentStreak = 0;
      const checkDate = new Date(today);
      while (completionDates.includes(checkDate.getTime())) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }

      // If today not completed, check from yesterday
      if (currentStreak === 0) {
        checkDate.setTime(today.getTime());
        checkDate.setDate(checkDate.getDate() - 1);
        while (completionDates.includes(checkDate.getTime())) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        }
      }

      // Calculate this week's completions
      const completionsThisWeek = completionDates.filter((t) => t >= monday.getTime()).length;

      // Build weekly completions array (Mon-Sun)
      const weeklyCompletions: boolean[] = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(monday);
        day.setDate(monday.getDate() + i);
        weeklyCompletions.push(completionDates.includes(day.getTime()));
      }

      // Determine if habit needs attention (had streak that broke)
      const hadStreakLastWeek = habit.completions.filter((c) => {
        const d = new Date(c.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() < monday.getTime();
      }).length >= 3;

      const needsAttention = hadStreakLastWeek && completionsThisWeek === 0;

      // Build implementation intention if available
      let implementationIntention = '';
      if (habit.cue && habit.location) {
        implementationIntention = `After ${habit.cue}, I will ${habit.name} at ${habit.location}.`;
        if (habit.obstacle && habit.backupPlan) {
          implementationIntention += ` If ${habit.obstacle.toLowerCase()}, I will ${habit.backupPlan}.`;
        }
      }

      return {
        id: habit.id,
        name: habit.name,
        category: habit.category,
        visibility: habit.visibility,
        currentStreak,
        completionsThisWeek,
        weeklyCompletions,
        needsAttention,
        implementationIntention,
      };
    });

    // Calculate overall stats
    const totalCompletionsAllTime = await prisma.habitCompletion.count({
      where: { userId: studentId },
    });

    const totalCompletionsThisWeek = habitsWithStats.reduce(
      (sum, h) => sum + h.completionsThisWeek,
      0
    );

    const bestStreak = Math.max(...habitsWithStats.map((h) => h.currentStreak), 0);

    // Today's index (0 = Monday, 6 = Sunday)
    const todayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    // Build weekly aggregate (did student complete anything each day?)
    const weeklyAggregate: boolean[] = [];
    for (let i = 0; i < 7; i++) {
      weeklyAggregate.push(habitsWithStats.some((h) => h.weeklyCompletions[i]));
    }

    // Get teacher's note for this student
    const teacherNote = await prisma.teacherNote.findUnique({
      where: {
        teacherId_studentId: {
          teacherId: session.user.id,
          studentId,
        },
      },
    });

    // Separate habits into needs attention vs on track
    const habitsNeedingAttention = habitsWithStats.filter((h) => h.needsAttention);
    const habitsOnTrack = habitsWithStats.filter((h) => !h.needsAttention);

    // Separate private habits
    const privateHabits = habitsWithStats.filter((h) => h.visibility === 'PRIVATE_TO_PEERS');
    const visibleHabitsNeedingAttention = habitsNeedingAttention.filter(
      (h) => h.visibility !== 'PRIVATE_TO_PEERS'
    );
    const visibleHabitsOnTrack = habitsOnTrack.filter(
      (h) => h.visibility !== 'PRIVATE_TO_PEERS'
    );

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.name || 'Unknown',
        email: student.email,
        image: student.image,
        xp: student.xp,
        level: student.level,
      },
      group: membership.group,
      stats: {
        totalCompletionsAllTime,
        totalCompletionsThisWeek,
        bestStreak,
        activeHabits: habits.length,
      },
      todayIndex,
      weeklyAggregate,
      habitsNeedingAttention: visibleHabitsNeedingAttention,
      habitsOnTrack: visibleHabitsOnTrack,
      privateHabits: privateHabits.map((h) => ({
        id: h.id,
        needsAttention: h.needsAttention,
      })),
      teacherNote: teacherNote?.noteText || '',
    });
  } catch (error) {
    console.error('Error fetching student data:', error);
    return NextResponse.json({ error: 'Failed to fetch student data' }, { status: 500 });
  }
}
