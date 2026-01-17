import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get groupId from query params
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    // Verify the teacher owns this group
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        teacherId: session.user.id,
      },
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found or access denied' }, { status: 404 });
    }

    // Get today's date for calculations
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get start of week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    // Get all students in this group with their data
    const memberships = await prisma.groupMembership.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            xp: true,
            level: true,
          },
        },
      },
    });

    // For each student, calculate their stats
    const studentSummaries = await Promise.all(
      memberships.map(async (membership) => {
        const userId = membership.user.id;

        // Get active habits count
        const activeHabits = await prisma.habit.count({
          where: {
            userId,
            isActive: true,
          },
        });

        // Get habit completions for the last 7 days to calculate recent completion rate
        const habits = await prisma.habit.findMany({
          where: {
            userId,
            isActive: true,
          },
          include: {
            completions: {
              where: {
                date: {
                  gte: startOfWeek,
                },
              },
            },
          },
        });

        // Calculate recent completion percentage (completions this week / possible completions)
        const totalPossibleCompletions = habits.length * 7; // 7 days in a week
        const totalCompletions = habits.reduce((sum, h) => sum + h.completions.length, 0);
        const recentCompletion = totalPossibleCompletions > 0
          ? Math.round((totalCompletions / totalPossibleCompletions) * 100)
          : 0;

        // Calculate best streak across all habits
        let bestStreak = 0;
        for (const habit of habits) {
          const allCompletions = await prisma.habitCompletion.findMany({
            where: { habitId: habit.id },
            orderBy: { date: 'desc' },
            take: 60,
          });

          if (allCompletions.length > 0) {
            const completionDates = new Set(
              allCompletions.map(c => {
                const d = new Date(c.date);
                d.setHours(0, 0, 0, 0);
                return d.getTime();
              })
            );

            // Calculate current streak
            let streak = 0;
            const checkDate = new Date(today);

            // Check from today backwards
            while (completionDates.has(checkDate.getTime())) {
              streak++;
              checkDate.setDate(checkDate.getDate() - 1);
            }

            // If today not completed, check from yesterday
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
        }

        // Count challenges joined
        const challengesJoined = await prisma.challengeParticipation.count({
          where: {
            userId,
            challenge: {
              groupId,
            },
          },
        });

        return {
          student: {
            id: membership.user.id,
            name: membership.user.name || 'Unknown',
            email: membership.user.email,
            image: membership.user.image,
            xp: membership.user.xp,
            level: membership.user.level,
          },
          activeHabits,
          recentCompletion,
          bestStreak,
          challengesJoined,
        };
      })
    );

    // Get active challenges for this group
    const challenges = await prisma.challenge.findMany({
      where: {
        groupId,
        isActive: true,
        endDate: {
          gte: today,
        },
      },
      orderBy: {
        endDate: 'asc',
      },
    });

    return NextResponse.json({
      group: {
        id: group.id,
        name: group.name,
        description: group.description,
        joinCode: group.joinCode,
      },
      studentSummaries,
      challenges,
      stats: {
        totalStudents: studentSummaries.length,
        activeChallenges: challenges.length,
        avgCompletion: studentSummaries.length > 0
          ? Math.round(
              studentSummaries.reduce((sum, s) => sum + s.recentCompletion, 0) /
                studentSummaries.length
            )
          : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching teacher dashboard:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
