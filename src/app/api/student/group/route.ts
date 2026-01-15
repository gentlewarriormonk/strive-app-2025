import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/student/group - Fetch the student's groups and classmates
 *
 * Visibility Rules:
 * - Students can only see habits marked PUBLIC_TO_CLASS
 * - ANONYMISED_ONLY habits are counted in aggregates but names hidden
 * - PRIVATE_TO_PEERS habits are completely hidden from other students
 * - Students can see their own habits regardless of visibility
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    // Get the student's group memberships
    const memberships = await prisma.groupMembership.findMany({
      where: { userId: session.user.id },
      include: {
        group: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                image: true,
                xp: true,
                level: true,
              },
            },
          },
        },
      },
    });

    if (memberships.length === 0) {
      return NextResponse.json({ groups: [], selectedGroup: null });
    }

    // Find the selected group or default to first
    const selectedMembership = groupId
      ? memberships.find(m => m.groupId === groupId)
      : memberships[0];

    if (!selectedMembership) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const selectedGroup = selectedMembership.group;

    // Get all members of this group
    const groupMembers = await prisma.groupMembership.findMany({
      where: { groupId: selectedGroup.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
            xp: true,
            level: true,
          },
        },
      },
    });

    // Get today's date for calculations
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate stats for each member with visibility filtering
    const membersWithStats = await Promise.all(
      groupMembers
        .filter(m => m.user.role === 'STUDENT')
        .map(async (membership) => {
          const userId = membership.user.id;
          const isCurrentUser = userId === session.user.id;

          // Get habits with visibility filtering
          // Current user sees all their own habits
          // Other users only see PUBLIC_TO_CLASS habits
          const habits = await prisma.habit.findMany({
            where: {
              userId,
              isActive: true,
              ...(isCurrentUser ? {} : { visibility: 'PUBLIC_TO_CLASS' }),
            },
            include: {
              completions: {
                orderBy: { date: 'desc' },
                take: 30,
              },
            },
          });

          // Calculate best streak from PUBLIC habits only for display
          let bestStreak = 0;
          for (const habit of habits) {
            const completionDates = new Set(
              habit.completions.map(c => {
                const d = new Date(c.date);
                d.setHours(0, 0, 0, 0);
                return d.getTime();
              })
            );

            let streak = 0;
            const checkDate = new Date(today);

            while (completionDates.has(checkDate.getTime())) {
              streak++;
              checkDate.setDate(checkDate.getDate() - 1);
            }

            if (streak === 0) {
              checkDate.setTime(today.getTime());
              checkDate.setDate(checkDate.getDate() - 1);
              while (completionDates.has(checkDate.getTime())) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
              }
            }

            if (streak > bestStreak) {
              bestStreak = streak;
            }
          }

          // For aggregates (completion count), include ANONYMISED_ONLY habits too
          // but don't expose the habit names
          const allHabitsForAggregate = await prisma.habit.findMany({
            where: {
              userId,
              isActive: true,
              visibility: { in: ['PUBLIC_TO_CLASS', 'ANONYMISED_ONLY'] },
            },
            select: {
              id: true,
              completions: {
                where: { date: today },
                take: 1,
              },
            },
          });

          const completedToday = allHabitsForAggregate.filter(h => h.completions.length > 0).length;
          const totalHabitsForAggregate = allHabitsForAggregate.length;

          return {
            user: membership.user,
            publicHabitCount: habits.length,
            bestStreak,
            // Aggregate stats (includes anonymised habits)
            completedToday,
            totalHabits: totalHabitsForAggregate,
            isCurrentUser,
          };
        })
    );

    // Calculate class-wide aggregate stats (including all non-private habits)
    const classStats = {
      totalStudents: membersWithStats.length,
      studentsCompletedToday: membersWithStats.filter(m => m.completedToday > 0).length,
      avgCompletionToday: membersWithStats.length > 0
        ? Math.round(
            membersWithStats.reduce((sum, m) =>
              sum + (m.totalHabits > 0 ? (m.completedToday / m.totalHabits) * 100 : 0), 0
            ) / membersWithStats.length
          )
        : 0,
    };

    return NextResponse.json({
      groups: memberships.map(m => ({
        id: m.group.id,
        name: m.group.name,
        description: m.group.description,
      })),
      selectedGroup: {
        id: selectedGroup.id,
        name: selectedGroup.name,
        description: selectedGroup.description,
        teacher: selectedGroup.teacher,
      },
      members: membersWithStats,
      classStats,
    });
  } catch (error) {
    console.error('Error fetching student group:', error);
    return NextResponse.json({ error: 'Failed to fetch group data' }, { status: 500 });
  }
}
