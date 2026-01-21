'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { MiniWeekDots, getWeekData } from '@/components/habits/WeeklyDots';
import { HabitCategory, getCategoryConfig } from '@/types/models';

interface HabitStats {
  totalCompletions: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  completionsThisWeek: number;
  completionsLastWeek: number;
  daysSinceStart: number;
}

interface HabitWithStats {
  id: string;
  name: string;
  category: HabitCategory;
  startDate: string;
  stats: HabitStats;
  dailyData: { date: string; completed: boolean }[];
  implementationIntention?: string;
}

interface ProgressData {
  user: {
    name: string;
    xpProgress: {
      currentXp: number;
      level: number;
      nextLevelXp: number;
      currentLevelXp: number;
      progressPercent: number;
    };
  };
  habits: HabitWithStats[];
  overallStats: {
    totalHabits: number;
    avgCompletionRate: number;
    bestStreak: number;
    totalCompletionsAllTime: number;
  };
  weeklyTrend: {
    thisWeek: number;
    lastWeek: number;
    change: number;
  };
  heatmapData: Record<string, number>;
}

// Get motivational message based on total completions
function getIdentityMessage(totalCompletions: number): string {
  if (totalCompletions === 0) return "Your journey begins with one step";
  if (totalCompletions < 10) return "Building the foundation";
  if (totalCompletions < 25) return "Finding your rhythm";
  if (totalCompletions < 50) return "Consistency is taking shape";
  if (totalCompletions < 100) return "Your habits are becoming you";
  if (totalCompletions < 200) return "This is who you are now";
  return "A master of your own growth";
}

// Get day of week name
function getDayName(): string {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' });
}

export default function TeacherJourneyPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    async function fetchProgress() {
      setIsLoading(true);
      setError(null);
      try {
        // Use the same progress API - it works for any authenticated user
        const response = await fetch('/api/student/progress');
        if (response.ok) {
          const data = await response.json();
          setProgressData(data);
        } else {
          setError('Failed to load progress data');
        }
      } catch (err) {
        console.error('Failed to fetch progress:', err);
        setError('Failed to load progress data');
      } finally {
        setIsLoading(false);
      }
    }
    fetchProgress();
  }, []);

  // Separate habits into "needs attention" (streak broken) and "on track"
  const { needsAttention, onTrack, weekData } = useMemo(() => {
    if (!progressData) return { needsAttention: [], onTrack: [], weekData: new Map() };

    const weekDataMap = new Map<string, { completions: boolean[]; todayIndex: number }>();

    progressData.habits.forEach(habit => {
      weekDataMap.set(habit.id, getWeekData(habit.dailyData));
    });

    // A habit "needs attention" if streak was > 2 and is now 0
    // Or if they completed last week but not this week yet
    const attention = progressData.habits.filter(h => {
      const data = weekDataMap.get(h.id);
      const completedAnyThisWeek = data?.completions.slice(0, data.todayIndex + 1).some(c => c);
      return (h.stats.longestStreak > 2 && h.stats.currentStreak === 0) ||
             (h.stats.completionsLastWeek > 0 && !completedAnyThisWeek);
    });

    const tracked = progressData.habits.filter(h => !attention.includes(h));

    return {
      needsAttention: attention,
      onTrack: tracked,
      weekData: weekDataMap,
    };
  }, [progressData]);

  // Loading state
  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#13c8ec] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-[#92c0c9]">Loading your journey...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !progressData) {
    return (
      <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <span className="material-symbols-outlined text-5xl text-[#92c0c9] mb-4">error</span>
            <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-[#92c0c9] mb-6">{error || 'Unable to load your progress data.'}</p>
          </div>
        </div>
      </div>
    );
  }

  const { overallStats } = progressData;

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-8">
        {/* Identity Header */}
        <div className="flex flex-col items-center text-center gap-4 py-6">
          <div className="relative">
            <div className="text-7xl md:text-8xl font-black gradient-text">
              {overallStats.totalCompletionsAllTime}
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[#92c0c9] text-sm whitespace-nowrap">
              completions
            </div>
          </div>
          <div className="mt-4">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {getIdentityMessage(overallStats.totalCompletionsAllTime)}
            </h1>
            <p className="text-[#92c0c9] mt-2">
              Happy {getDayName()}. Keep building the person you want to become.
            </p>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#192f33] rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-[#F5A623]">{overallStats.bestStreak}</p>
            <p className="text-[#92c0c9] text-xs mt-1">Best Streak</p>
          </div>
          <div className="bg-[#192f33] rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{overallStats.totalHabits}</p>
            <p className="text-[#92c0c9] text-xs mt-1">Active Habits</p>
          </div>
          <div className="bg-[#192f33] rounded-xl p-4 text-center">
            <p className="text-2xl font-bold gradient-text">{overallStats.avgCompletionRate}%</p>
            <p className="text-[#92c0c9] text-xs mt-1">Avg Rate</p>
          </div>
        </div>

        {/* Get Back on Track Section */}
        {needsAttention.length > 0 && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#F5A623]">warning</span>
              <h2 className="text-lg font-bold text-white">Get Back on Track</h2>
            </div>
            <p className="text-[#92c0c9] text-sm -mt-2">
              These habits could use some love. Remember: never miss twice.
            </p>
            <div className="flex flex-col gap-3">
              {needsAttention.map((habit) => {
                const categoryConfig = getCategoryConfig(habit.category);
                const data = weekData.get(habit.id);
                return (
                  <div
                    key={habit.id}
                    className="bg-[#192f33] rounded-xl p-4 border-l-4 border-[#F5A623]/50"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${categoryConfig.bgColor} flex-shrink-0`}>
                        <span className={`material-symbols-outlined ${categoryConfig.color}`}>
                          {categoryConfig.icon}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium">{habit.name}</p>
                        <div className="flex items-center gap-3 mt-2">
                          {data && (
                            <MiniWeekDots
                              completions={data.completions}
                              todayIndex={data.todayIndex}
                            />
                          )}
                          <span className="text-[#92c0c9] text-xs">
                            Last completed {habit.stats.currentStreak === 0 ? 'a while ago' : `${habit.stats.daysSinceStart - habit.stats.totalCompletions} days ago`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* On Track Section */}
        {onTrack.length > 0 && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#13c8ec]">check_circle</span>
              <h2 className="text-lg font-bold text-white">On Track</h2>
            </div>
            <div className="flex flex-col gap-3">
              {onTrack.map((habit) => {
                const categoryConfig = getCategoryConfig(habit.category);
                const data = weekData.get(habit.id);
                return (
                  <div
                    key={habit.id}
                    className="bg-[#192f33] rounded-xl p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${categoryConfig.bgColor} flex-shrink-0`}>
                        <span className={`material-symbols-outlined ${categoryConfig.color}`}>
                          {categoryConfig.icon}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-white font-medium">{habit.name}</p>
                          {habit.stats.currentStreak > 0 && (
                            <div className="flex items-center gap-1 text-xs">
                              <span className="material-symbols-outlined !text-sm text-[#F5A623]">
                                local_fire_department
                              </span>
                              <span className="text-[#F5A623] font-medium">{habit.stats.currentStreak}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          {data && (
                            <MiniWeekDots
                              completions={data.completions}
                              todayIndex={data.todayIndex}
                            />
                          )}
                          <span className="text-[#92c0c9] text-xs">
                            {habit.stats.completionsThisWeek} this week
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* No Habits State */}
        {progressData.habits.length === 0 && (
          <div className="bg-[#192f33] rounded-xl p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-[#92c0c9] mb-3">route</span>
            <p className="text-white font-medium mb-2">Your journey awaits</p>
            <p className="text-[#92c0c9] text-sm mb-6">
              Create your first habit to start tracking your progress.
            </p>
            <Link
              href="/habits/new"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#13c8ec] text-[#101f22] font-bold hover:bg-[#0ea5c7] transition-colors"
            >
              <span className="material-symbols-outlined !text-lg">auto_awesome</span>
              Design a Habit
            </Link>
          </div>
        )}

        {/* Weekly Reflection Prompt (show on Sundays) */}
        {progressData.habits.length > 0 && new Date().getDay() === 0 && (
          <div className="bg-gradient-to-br from-[#13c8ec]/10 to-[#3b82f6]/10 rounded-xl p-5 border border-[#13c8ec]/20">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#13c8ec]">lightbulb</span>
              <div>
                <p className="text-white font-medium">Sunday Reflection</p>
                <p className="text-[#92c0c9] text-sm mt-1">
                  What went well this week? What will you do differently next week?
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Stats Drawer */}
        <div className="border-t border-white/10 pt-4">
          <button
            onClick={() => setShowStats(!showStats)}
            className="flex items-center justify-between w-full py-3 text-[#92c0c9] hover:text-white transition-colors"
          >
            <span className="text-sm font-medium">Detailed Statistics</span>
            <span className={`material-symbols-outlined !text-lg transition-transform ${showStats ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>

          {showStats && (
            <div className="flex flex-col gap-6 pt-4">
              {/* Category Summary */}
              <div>
                <h3 className="text-sm font-medium text-white mb-3">By Category</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(
                    progressData.habits.reduce((acc, h) => {
                      if (!acc[h.category]) {
                        acc[h.category] = { count: 0, avgRate: 0, totalRate: 0 };
                      }
                      acc[h.category].count++;
                      acc[h.category].totalRate += h.stats.completionRate;
                      acc[h.category].avgRate = Math.round(acc[h.category].totalRate / acc[h.category].count);
                      return acc;
                    }, {} as Record<string, { count: number; avgRate: number; totalRate: number }>)
                  ).map(([category, data]) => {
                    const config = getCategoryConfig(category);
                    return (
                      <div key={category} className="bg-[#192f33] rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`material-symbols-outlined !text-lg ${config.color}`}>
                            {config.icon}
                          </span>
                          <span className="text-white text-sm font-medium truncate">{category}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold text-white">{data.avgRate}%</span>
                          <span className="text-xs text-[#92c0c9]">{data.count} habit{data.count > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Weekly Trend */}
              <div>
                <h3 className="text-sm font-medium text-white mb-3">This Week vs Last Week</h3>
                <div className="bg-[#192f33] rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#92c0c9] text-xs">This week</p>
                      <p className="text-2xl font-bold text-white">{progressData.weeklyTrend.thisWeek}</p>
                    </div>
                    <div className="text-center">
                      <span className={`material-symbols-outlined text-2xl ${
                        progressData.weeklyTrend.change > 0 ? 'text-green-400' :
                        progressData.weeklyTrend.change < 0 ? 'text-red-400' :
                        'text-[#92c0c9]'
                      }`}>
                        {progressData.weeklyTrend.change > 0 ? 'trending_up' :
                         progressData.weeklyTrend.change < 0 ? 'trending_down' :
                         'trending_flat'}
                      </span>
                      <p className="text-xs text-[#92c0c9]">
                        {progressData.weeklyTrend.change > 0 ? '+' : ''}{progressData.weeklyTrend.change}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#92c0c9] text-xs">Last week</p>
                      <p className="text-2xl font-bold text-[#92c0c9]">{progressData.weeklyTrend.lastWeek}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Back to Habits Link */}
        <Link
          href="/teacher/habits"
          className="flex items-center justify-center gap-2 py-3 text-[#13c8ec] hover:text-[#0ea5c7] transition-colors"
        >
          <span className="material-symbols-outlined !text-lg">arrow_back</span>
          Back to My Habits
        </Link>
      </div>
    </div>
  );
}
