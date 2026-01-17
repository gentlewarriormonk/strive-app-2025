import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/student/profile/[id] - Fetch a student's profile with visibility-aware habits
 *
 * Visibility Rules:
 * - If viewer is the student themselves: see all habits
 * - If viewer is a teacher of the student's class: see all habits
 * - If viewer is a classmate: only see PUBLIC_TO_CLASS habits
 * - ANONYMISED_ONLY and PRIVATE_TO_PEERS are hidden from classmates
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: profileUserId } = await params;

    // Get the profile user
    const profileUser = await prisma.user.findUnique({
      where: { id: profileUserId },
      select: {
        id: true,
        name: true,
        image: true,
        role: true,
        xp: true,
        level: true,
      },
    });

    if (!profileUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const viewerId = session.user.id;
    const isOwnProfile = viewerId === profileUserId;

    // Check if viewer is a teacher of this student
    let isTeacherOfStudent = false;
    if (!isOwnProfile && session.user.role === 'TEACHER') {
      // Find if the teacher has any group that this student is a member of
      const teacherGroups = await prisma.group.findMany({
        where: { teacherId: viewerId },
        select: { id: true },
      });

      if (teacherGroups.length > 0) {
        const studentMembership = await prisma.groupMembership.findFirst({
          where: {
            userId: profileUserId,
            groupId: { in: teacherGroups.map(g => g.id) },
          },
        });
        isTeacherOfStudent = !!studentMembership;
      }
    }

    // Check if viewer is a classmate (in the same group as the profile user)
    let isClassmate = false;
    if (!isOwnProfile && !isTeacherOfStudent) {
      // Get groups where the viewer is a member
      const viewerGroups = await prisma.groupMembership.findMany({
        where: { userId: viewerId },
        select: { groupId: true },
      });

      if (viewerGroups.length > 0) {
        // Check if profile user is in any of the same groups
        const sharedMembership = await prisma.groupMembership.findFirst({
          where: {
            userId: profileUserId,
            groupId: { in: viewerGroups.map(g => g.groupId) },
          },
        });
        isClassmate = !!sharedMembership;
      }
    }

    // Authorization check: Must be self, teacher of student, or classmate
    if (!isOwnProfile && !isTeacherOfStudent && !isClassmate) {
      return NextResponse.json({ error: 'Not authorized to view this profile' }, { status: 403 });
    }

    // Determine visibility filter
    // Own profile or teacher: see all habits
    // Classmate: only PUBLIC_TO_CLASS
    const canSeeAllHabits = isOwnProfile || isTeacherOfStudent;

    // Get habits with appropriate visibility filter
    const habits = await prisma.habit.findMany({
      where: {
        userId: profileUserId,
        isActive: true,
        ...(canSeeAllHabits ? {} : { visibility: 'PUBLIC_TO_CLASS' }),
      },
      include: {
        completions: {
          orderBy: { date: 'desc' },
          take: 60,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get today's date for calculations
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get start of week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    // Calculate stats for each habit
    const habitsWithStats = habits.map(habit => {
      const completionDates = new Set(
        habit.completions.map(c => {
          const d = new Date(c.date);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        })
      );

      // Calculate current streak
      let currentStreak = 0;
      const checkDate = new Date(today);

      while (completionDates.has(checkDate.getTime())) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }

      // If today not completed, check from yesterday
      if (currentStreak === 0) {
        checkDate.setTime(today.getTime());
        checkDate.setDate(checkDate.getDate() - 1);
        while (completionDates.has(checkDate.getTime())) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        }
      }

      // Calculate longest streak
      let longestStreak = 0;
      let tempStreak = 0;
      const sortedDates = Array.from(completionDates).sort((a, b) => b - a);

      for (let i = 0; i < sortedDates.length; i++) {
        if (i === 0) {
          tempStreak = 1;
        } else {
          const diff = sortedDates[i - 1] - sortedDates[i];
          if (diff === 86400000) { // 1 day in ms
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);

      // Completions this week
      const completionsThisWeek = Array.from(completionDates)
        .filter(t => t >= startOfWeek.getTime())
        .length;

      // Calculate completion rate (last 30 days)
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const completionsLast30Days = Array.from(completionDates)
        .filter(t => t >= thirtyDaysAgo.getTime())
        .length;
      const completionRate = Math.round((completionsLast30Days / 30) * 100);

      // Remove completions array from response
      const { completions, ...habitData } = habit;

      return {
        ...habitData,
        stats: {
          currentStreak,
          longestStreak,
          completionsThisWeek,
          completionRate,
        },
      };
    });

    // Calculate category summaries
    const categorySummaries: Record<string, { habitCount: number; avgCompletion: number; bestStreak: number }> = {};

    for (const h of habitsWithStats) {
      if (!categorySummaries[h.category]) {
        categorySummaries[h.category] = { habitCount: 0, avgCompletion: 0, bestStreak: 0 };
      }
      categorySummaries[h.category].habitCount++;
      categorySummaries[h.category].avgCompletion += h.stats.completionRate;
      categorySummaries[h.category].bestStreak = Math.max(
        categorySummaries[h.category].bestStreak,
        h.stats.longestStreak
      );
    }

    // Average out completion rates
    for (const cat of Object.keys(categorySummaries)) {
      categorySummaries[cat].avgCompletion = Math.round(
        categorySummaries[cat].avgCompletion / categorySummaries[cat].habitCount
      );
    }

    // Overall best streak
    const bestStreak = habitsWithStats.length > 0
      ? Math.max(...habitsWithStats.map(h => h.stats.longestStreak))
      : 0;

    return NextResponse.json({
      user: profileUser,
      habits: habitsWithStats,
      categorySummaries,
      bestStreak,
      viewerContext: {
        isOwnProfile,
        isTeacherOfStudent,
        canSeeAllHabits,
      },
    });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
