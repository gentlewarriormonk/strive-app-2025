import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getXPForNextLevel } from '@/types/models';

/**
 * GET /api/student/progress - Fetch student's progress data
 *
 * Returns:
 * - User XP/level info
 * - All habits with completions for the past 12 weeks
 * - Computed stats for each habit (streak, completion rate, etc.)
 * - Weekly trend comparison
 * - Heatmap data (all completions organized by date)
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user's XP and level
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        xp: true,
        level: true,
        name: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate XP progress
    const nextLevelXP = getXPForNextLevel(user.level);
    const currentLevelXP = user.level > 1 ? getXPForNextLevel(user.level - 1) : 0;
    const xpProgress = {
      currentXp: user.xp,
      level: user.level,
      nextLevelXp: nextLevelXP,
      currentLevelXp: currentLevelXP,
      progressPercent: nextLevelXP > currentLevelXP
        ? Math.round(((user.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100)
        : 100,
    };

    // Get date references
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 12 weeks ago (84 days)
    const twelveWeeksAgo = new Date(today);
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

    // Start of this week (Sunday)
    const startOfThisWeek = new Date(today);
    startOfThisWeek.setDate(today.getDate() - today.getDay());

    // Start of last week
    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    // Get all habits with completions
    const habits = await prisma.habit.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        completions: {
          where: {
            date: {
              gte: twelveWeeksAgo,
            },
          },
          orderBy: { date: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Process each habit to calculate stats
    const habitsWithStats = habits.map(habit => {
      const completionTimestamps = habit.completions.map(c => {
        const d = new Date(c.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      });
      const completionSet = new Set(completionTimestamps);

      // Calculate days since habit started
      const habitStartDate = new Date(habit.startDate);
      habitStartDate.setHours(0, 0, 0, 0);
      const daysSinceStart = Math.max(1, Math.ceil((today.getTime() - habitStartDate.getTime()) / (1000 * 60 * 60 * 24)));

      // Total completions (unique days)
      const totalCompletions = completionSet.size;

      // Overall completion rate
      const completionRate = Math.round((totalCompletions / daysSinceStart) * 100);

      // Calculate current streak
      let currentStreak = 0;
      const checkDate = new Date(today);

      // Check if today is completed
      if (completionSet.has(checkDate.getTime())) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }

      // Count backwards
      while (completionSet.has(checkDate.getTime())) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }

      // If today not completed, start from yesterday
      if (currentStreak === 0) {
        checkDate.setTime(today.getTime());
        checkDate.setDate(checkDate.getDate() - 1);
        while (completionSet.has(checkDate.getTime())) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        }
      }

      // Calculate longest streak
      let longestStreak = 0;
      let tempStreak = 0;
      const sortedTimestamps = Array.from(completionSet).sort((a, b) => a - b);

      for (let i = 0; i < sortedTimestamps.length; i++) {
        if (i === 0) {
          tempStreak = 1;
        } else {
          const diff = sortedTimestamps[i] - sortedTimestamps[i - 1];
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
      const completionsThisWeek = Array.from(completionSet)
        .filter(t => t >= startOfThisWeek.getTime())
        .length;

      // Completions last week
      const completionsLastWeek = Array.from(completionSet)
        .filter(t => t >= startOfLastWeek.getTime() && t < startOfThisWeek.getTime())
        .length;

      // Generate daily data for the last 84 days (for heatmap/charts)
      const dailyData: { date: string; completed: boolean }[] = [];
      for (let i = 83; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        // Only include if after habit start date
        if (date >= habitStartDate) {
          dailyData.push({
            date: date.toISOString().split('T')[0],
            completed: completionSet.has(date.getTime()),
          });
        }
      }

      // Remove completions from response
      const { completions, ...habitData } = habit;

      return {
        ...habitData,
        startDate: habit.startDate.toISOString(),
        stats: {
          totalCompletions,
          completionRate,
          currentStreak,
          longestStreak,
          completionsThisWeek,
          completionsLastWeek,
          daysSinceStart,
        },
        dailyData,
      };
    });

    // Calculate overall stats
    const totalCompletionsThisWeek = habitsWithStats.reduce(
      (sum, h) => sum + h.stats.completionsThisWeek, 0
    );
    const totalCompletionsLastWeek = habitsWithStats.reduce(
      (sum, h) => sum + h.stats.completionsLastWeek, 0
    );
    const avgCompletionRate = habitsWithStats.length > 0
      ? Math.round(habitsWithStats.reduce((sum, h) => sum + h.stats.completionRate, 0) / habitsWithStats.length)
      : 0;
    const bestStreak = habitsWithStats.length > 0
      ? Math.max(...habitsWithStats.map(h => h.stats.longestStreak))
      : 0;

    // Build heatmap data: aggregate all completions by date
    const heatmapData: Record<string, number> = {};
    for (const habit of habitsWithStats) {
      for (const day of habit.dailyData) {
        if (day.completed) {
          heatmapData[day.date] = (heatmapData[day.date] || 0) + 1;
        }
      }
    }

    // Weekly trend
    const weeklyTrend = {
      thisWeek: totalCompletionsThisWeek,
      lastWeek: totalCompletionsLastWeek,
      change: totalCompletionsLastWeek > 0
        ? Math.round(((totalCompletionsThisWeek - totalCompletionsLastWeek) / totalCompletionsLastWeek) * 100)
        : (totalCompletionsThisWeek > 0 ? 100 : 0),
    };

    return NextResponse.json({
      user: {
        name: user.name,
        xpProgress,
      },
      habits: habitsWithStats,
      overallStats: {
        totalHabits: habitsWithStats.length,
        avgCompletionRate,
        bestStreak,
        totalCompletionsAllTime: habitsWithStats.reduce((sum, h) => sum + h.stats.totalCompletions, 0),
      },
      weeklyTrend,
      heatmapData,
    });
  } catch (error) {
    console.error('Error fetching student progress:', error);
    return NextResponse.json({ error: 'Failed to fetch progress data' }, { status: 500 });
  }
}
