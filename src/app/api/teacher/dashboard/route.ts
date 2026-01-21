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

    // Get start of week (Monday-based)
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    // Get last week's Monday for comparison
    const lastWeekMonday = new Date(monday);
    lastWeekMonday.setDate(lastWeekMonday.getDate() - 7);

    // Get all students in this group with their habits and completions
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
            habits: {
              where: { isActive: true },
              include: {
                completions: {
                  where: {
                    date: {
                      gte: lastWeekMonday, // Get 2 weeks of data
                    },
                  },
                  orderBy: { date: 'desc' },
                },
              },
            },
            habitCompletions: {
              orderBy: { date: 'desc' },
              take: 1, // Just need the most recent for "last active"
            },
          },
        },
      },
    });

    // Calculate daily completion aggregates for Class Pulse (Mon-Sun)
    const dailyCompletions: number[] = [0, 0, 0, 0, 0, 0, 0];
    const dailyStudentCounts: number[] = [0, 0, 0, 0, 0, 0, 0];

    // Track celebrations and patterns
    const celebrations: { type: string; studentName: string; detail: string }[] = [];
    const studentsNeedingSupport: {
      id: string;
      name: string;
      reason: string;
      lastActive: string | null;
    }[] = [];

    // Today's index in the week (0 = Monday, 6 = Sunday)
    const todayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    // For each student, calculate their stats
    const studentSummaries = memberships.map((membership) => {
      const user = membership.user;
      const habits = user.habits;

      // Calculate last active date
      const lastCompletion = user.habitCompletions[0];
      const lastActive = lastCompletion
        ? new Date(lastCompletion.date).toISOString().split('T')[0]
        : null;

      // Days since last active
      let daysSinceLastActive = lastActive
        ? Math.floor((today.getTime() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      // Calculate this week's completions and streaks
      let totalCompletionsThisWeek = 0;
      let totalCompletionsLastWeek = 0;
      let bestCurrentStreak = 0;
      let brokenStreakCount = 0;

      habits.forEach((habit) => {
        const completionDates = habit.completions.map((c) => {
          const d = new Date(c.date);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        });

        // Count this week's completions
        const thisWeekCompletions = completionDates.filter((t) => t >= monday.getTime()).length;
        totalCompletionsThisWeek += thisWeekCompletions;

        // Count last week's completions
        const lastWeekCompletions = completionDates.filter(
          (t) => t >= lastWeekMonday.getTime() && t < monday.getTime()
        ).length;
        totalCompletionsLastWeek += lastWeekCompletions;

        // Add to daily aggregates
        for (let i = 0; i <= todayIndex; i++) {
          const day = new Date(monday);
          day.setDate(monday.getDate() + i);
          if (completionDates.includes(day.getTime())) {
            dailyCompletions[i]++;
          }
        }

        // Calculate current streak
        let currentStreak = 0;
        const checkDate = new Date(today);

        while (completionDates.includes(checkDate.getTime())) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        }

        // If not completed today, check from yesterday
        if (currentStreak === 0 && checkDate.getTime() === today.getTime()) {
          checkDate.setDate(checkDate.getDate() - 1);
          while (completionDates.includes(checkDate.getTime())) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          }
        }

        if (currentStreak > bestCurrentStreak) {
          bestCurrentStreak = currentStreak;
        }

        // Check for broken streaks (had completions last week but none this week)
        if (lastWeekCompletions >= 3 && thisWeekCompletions === 0) {
          brokenStreakCount++;
        }
      });

      // Track students who completed at least one habit each day
      for (let i = 0; i <= todayIndex; i++) {
        const day = new Date(monday);
        day.setDate(monday.getDate() + i);
        const dayTime = day.getTime();

        const hasCompletionOnDay = habits.some((habit) =>
          habit.completions.some((c) => {
            const d = new Date(c.date);
            d.setHours(0, 0, 0, 0);
            return d.getTime() === dayTime;
          })
        );

        if (hasCompletionOnDay) {
          dailyStudentCounts[i]++;
        }
      }

      // Check for celebrations
      // Streak milestones (7, 14, 21, 30 days)
      if ([7, 14, 21, 30].includes(bestCurrentStreak)) {
        const habitWithStreak = habits.find((h) => {
          let streak = 0;
          const checkDate = new Date(today);
          const dates = h.completions.map((c) => {
            const d = new Date(c.date);
            d.setHours(0, 0, 0, 0);
            return d.getTime();
          });
          while (dates.includes(checkDate.getTime())) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          }
          return streak === bestCurrentStreak;
        });

        if (habitWithStreak) {
          celebrations.push({
            type: 'streak',
            studentName: user.name || 'A student',
            detail: `${bestCurrentStreak}-day streak on "${habitWithStreak.name}"`,
          });
        }
      }

      // XP milestones (50, 100, 200, 500, 1000)
      const xpMilestones = [50, 100, 200, 500, 1000];
      for (const milestone of xpMilestones) {
        if (user.xp >= milestone && user.xp - totalCompletionsThisWeek * 10 < milestone) {
          celebrations.push({
            type: 'xp',
            studentName: user.name || 'A student',
            detail: `reached ${milestone} total completions`,
          });
          break;
        }
      }

      // Check for students needing support
      if (daysSinceLastActive >= 5) {
        studentsNeedingSupport.push({
          id: user.id,
          name: user.name || 'Unknown',
          reason: `Last active ${daysSinceLastActive} days ago`,
          lastActive,
        });
      } else if (brokenStreakCount >= 2) {
        studentsNeedingSupport.push({
          id: user.id,
          name: user.name || 'Unknown',
          reason: `${brokenStreakCount} habits need attention`,
          lastActive,
        });
      } else if (totalCompletionsLastWeek >= 5 && totalCompletionsThisWeek <= 1) {
        studentsNeedingSupport.push({
          id: user.id,
          name: user.name || 'Unknown',
          reason: 'Significant drop in activity this week',
          lastActive,
        });
      }

      return {
        student: {
          id: user.id,
          name: user.name || 'Unknown',
          email: user.email,
          image: user.image,
          xp: user.xp,
          level: user.level,
        },
        activeHabits: habits.length,
        lastActive,
        completionsThisWeek: totalCompletionsThisWeek,
        completionsLastWeek: totalCompletionsLastWeek,
        bestStreak: bestCurrentStreak,
      };
    });

    // Calculate Class Pulse - what percentage of class was active each day
    const totalStudents = memberships.length;
    const classPulse = dailyStudentCounts.map((count) =>
      totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0
    );

    // Count how many students completed all their habits yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const studentsCompletedAllYesterday = memberships.filter((m) => {
      const habits = m.user.habits;
      if (habits.length === 0) return false;
      return habits.every((h) =>
        h.completions.some((c) => {
          const d = new Date(c.date);
          d.setHours(0, 0, 0, 0);
          return d.getTime() === yesterday.getTime();
        })
      );
    }).length;

    if (studentsCompletedAllYesterday > 0) {
      celebrations.push({
        type: 'allComplete',
        studentName: '',
        detail: `${studentsCompletedAllYesterday} student${studentsCompletedAllYesterday > 1 ? 's' : ''} completed all their habits yesterday`,
      });
    }

    // Calculate total completions this week
    const totalCompletionsThisWeek = studentSummaries.reduce(
      (sum, s) => sum + s.completionsThisWeek,
      0
    );

    // Active students this week
    const activeStudentsThisWeek = studentSummaries.filter(
      (s) => s.completionsThisWeek > 0
    ).length;

    return NextResponse.json({
      group: {
        id: group.id,
        name: group.name,
        description: group.description,
        joinCode: group.joinCode,
      },
      studentSummaries,
      celebrations: celebrations.slice(0, 5), // Limit to 5 celebrations
      studentsNeedingSupport,
      classPulse,
      todayIndex,
      stats: {
        totalStudents,
        activeStudentsThisWeek,
        totalCompletionsThisWeek,
      },
    });
  } catch (error) {
    console.error('Error fetching teacher dashboard:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
