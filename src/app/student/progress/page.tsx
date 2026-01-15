'use client';

import { useState, useEffect, useMemo } from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { SectionCard } from '@/components/ui/SectionCard';
import { CategorySummaryCard } from '@/components/CategorySummaryCard';
import { HabitCategory, CATEGORY_CONFIG } from '@/types/models';

type TimeRange = 7 | 14 | 28;

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

/**
 * DayBar - Single vertical bar representing one day's completion status.
 */
function DayBar({ completed, title }: { completed: boolean; title: string }) {
  return (
    <div
      className={`h-6 w-2 rounded-sm transition-all flex-shrink-0 ${
        completed
          ? 'bg-[#13c8ec]'
          : 'bg-[#13c8ec]/20 border border-[#13c8ec]/30'
      }`}
      title={title}
    />
  );
}

/**
 * HeatmapCell - Single cell in the GitHub-style heatmap
 */
function HeatmapCell({ count, date, maxCount }: { count: number; date: string; maxCount: number }) {
  // Calculate intensity (0-4 levels)
  let intensity = 0;
  if (count > 0) {
    intensity = Math.min(4, Math.ceil((count / Math.max(maxCount, 1)) * 4));
  }

  const colors = [
    'bg-[#1a3a40]', // 0 - empty
    'bg-[#13c8ec]/30', // 1
    'bg-[#13c8ec]/50', // 2
    'bg-[#13c8ec]/70', // 3
    'bg-[#13c8ec]', // 4 - full
  ];

  return (
    <div
      className={`w-3 h-3 rounded-sm ${colors[intensity]}`}
      title={`${date}: ${count} completion${count !== 1 ? 's' : ''}`}
    />
  );
}

export default function StudentProgressPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>(28);
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | 'all'>('all');

  useEffect(() => {
    async function fetchProgress() {
      setIsLoading(true);
      setError(null);
      try {
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

  // Filter habits by category and calculate stats for time range
  const filteredHabitsWithStats = useMemo(() => {
    if (!progressData) return [];

    return progressData.habits
      .filter(h => selectedCategory === 'all' || h.category === selectedCategory)
      .map(habit => {
        // Filter daily data to time range
        const rangeData = habit.dailyData.slice(-timeRange);
        const completedInRange = rangeData.filter(d => d.completed).length;
        const completionRate = rangeData.length > 0
          ? Math.round((completedInRange / rangeData.length) * 100)
          : 0;

        return {
          ...habit,
          rangeData,
          rangeStats: {
            completed: completedInRange,
            total: rangeData.length,
            completionRate,
          },
        };
      });
  }, [progressData, timeRange, selectedCategory]);

  // Calculate overall stats for time range
  const overallRangeStats = useMemo(() => {
    if (!progressData || filteredHabitsWithStats.length === 0) {
      return { avgCompletion: 0, totalCompletions: 0, bestStreak: 0 };
    }

    const avgCompletion = Math.round(
      filteredHabitsWithStats.reduce((sum, h) => sum + h.rangeStats.completionRate, 0) /
        filteredHabitsWithStats.length
    );
    const totalCompletions = filteredHabitsWithStats.reduce(
      (sum, h) => sum + h.rangeStats.completed, 0
    );
    const bestStreak = Math.max(
      ...filteredHabitsWithStats.map(h => h.stats.longestStreak)
    );

    return { avgCompletion, totalCompletions, bestStreak };
  }, [progressData, filteredHabitsWithStats]);

  // Calculate category summaries
  const categorySummaries = useMemo(() => {
    if (!progressData) return [];

    return Object.keys(CATEGORY_CONFIG)
      .map(cat => {
        const categoryHabits = progressData.habits.filter(h => h.category === cat);
        if (categoryHabits.length === 0) return null;

        const avgCompletion = Math.round(
          categoryHabits.reduce((sum, h) => sum + h.stats.completionRate, 0) /
            categoryHabits.length
        );
        const longestStreak = Math.max(
          ...categoryHabits.map(h => h.stats.longestStreak)
        );

        return {
          category: cat as HabitCategory,
          avgCompletion,
          longestStreak,
        };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);
  }, [progressData]);

  // Generate heatmap grid (12 weeks = 84 days)
  const heatmapGrid = useMemo(() => {
    if (!progressData) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate how many days to show (full weeks + partial current week)
    const totalDays = 84;

    // Build the grid: 7 rows (days of week) x N columns (weeks)
    const weeks: { date: string; count: number }[][] = [];
    let currentWeek: { date: string; count: number }[] = [];

    for (let i = totalDays - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();

      // Start new week on Sunday
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      currentWeek.push({
        date: dateStr,
        count: progressData.heatmapData[dateStr] || 0,
      });
    }

    // Push final week
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  }, [progressData]);

  // Get max count for heatmap intensity
  const maxHeatmapCount = useMemo(() => {
    if (!progressData) return 1;
    const counts = Object.values(progressData.heatmapData);
    return counts.length > 0 ? Math.max(...counts) : 1;
  }, [progressData]);

  // Loading state
  if (isLoading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#13c8ec] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-[#92c0c9]">Loading your progress...</p>
          </div>
        </div>
      </PageShell>
    );
  }

  // Error state
  if (error || !progressData) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <span className="material-symbols-outlined text-5xl text-[#92c0c9] mb-4">error</span>
            <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-[#92c0c9] mb-6">{error || 'Unable to load your progress data.'}</p>
          </div>
        </div>
      </PageShell>
    );
  }

  const { user, overallStats, weeklyTrend } = progressData;

  return (
    <PageShell>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Your Progress
            </h1>
          </div>
        </div>

        {/* XP Progress */}
        <SectionCard>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#F5A623] text-2xl">military_tech</span>
                <div>
                  <p className="text-white font-bold text-lg">Level {user.xpProgress.level}</p>
                  <p className="text-[#92c0c9] text-sm">{user.xpProgress.currentXp} XP total</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[#13c8ec] font-bold">{user.xpProgress.progressPercent}%</p>
                <p className="text-[#92c0c9] text-xs">to Level {user.xpProgress.level + 1}</p>
              </div>
            </div>
            <div className="w-full bg-[#325e67] rounded-full h-3">
              <div
                className="bg-gradient-to-r from-[#13c8ec] to-[#3b82f6] h-3 rounded-full transition-all"
                style={{ width: `${Math.min(user.xpProgress.progressPercent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-[#92c0c9]">
              {user.xpProgress.nextLevelXp - user.xpProgress.currentXp > 0
                ? `${user.xpProgress.nextLevelXp - user.xpProgress.currentXp} XP until Level ${user.xpProgress.level + 1}`
                : 'Max level reached!'}
            </p>
          </div>
        </SectionCard>

        {/* Weekly Trend */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <SectionCard padding="md">
            <div className="text-center">
              <p className="text-3xl font-bold text-[#13c8ec]">{weeklyTrend.thisWeek}</p>
              <p className="text-[#92c0c9] text-sm">This Week</p>
            </div>
          </SectionCard>
          <SectionCard padding="md">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{weeklyTrend.lastWeek}</p>
              <p className="text-[#92c0c9] text-sm">Last Week</p>
            </div>
          </SectionCard>
          <SectionCard padding="md">
            <div className="text-center">
              <p className={`text-3xl font-bold ${weeklyTrend.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {weeklyTrend.change >= 0 ? '+' : ''}{weeklyTrend.change}%
              </p>
              <p className="text-[#92c0c9] text-sm">Change</p>
            </div>
          </SectionCard>
          <SectionCard padding="md">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{overallStats.totalCompletionsAllTime}</p>
              <p className="text-[#92c0c9] text-sm">All Time</p>
            </div>
          </SectionCard>
        </div>

        {/* Completion Heatmap */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Activity Heatmap (Last 12 Weeks)</h2>
          <SectionCard>
            <div className="overflow-x-auto">
              <div className="flex gap-1 min-w-fit">
                {/* Day labels */}
                <div className="flex flex-col gap-1 mr-2 text-xs text-[#92c0c9]">
                  <div className="h-3">S</div>
                  <div className="h-3">M</div>
                  <div className="h-3">T</div>
                  <div className="h-3">W</div>
                  <div className="h-3">T</div>
                  <div className="h-3">F</div>
                  <div className="h-3">S</div>
                </div>
                {/* Weeks */}
                {heatmapGrid.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-1">
                    {/* Pad first week if needed */}
                    {weekIdx === 0 && week.length < 7 && (
                      Array.from({ length: 7 - week.length }).map((_, i) => (
                        <div key={`pad-${i}`} className="w-3 h-3" />
                      ))
                    )}
                    {week.map((day) => (
                      <HeatmapCell
                        key={day.date}
                        date={day.date}
                        count={day.count}
                        maxCount={maxHeatmapCount}
                      />
                    ))}
                  </div>
                ))}
              </div>
              {/* Legend */}
              <div className="flex items-center justify-end gap-2 mt-4 text-xs text-[#92c0c9]">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-sm bg-[#1a3a40]" />
                  <div className="w-3 h-3 rounded-sm bg-[#13c8ec]/30" />
                  <div className="w-3 h-3 rounded-sm bg-[#13c8ec]/50" />
                  <div className="w-3 h-3 rounded-sm bg-[#13c8ec]/70" />
                  <div className="w-3 h-3 rounded-sm bg-[#13c8ec]" />
                </div>
                <span>More</span>
              </div>
            </div>
          </SectionCard>
        </section>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4">
          {/* Time Range */}
          <div className="flex flex-col w-full sm:w-auto">
            <label className="text-sm font-medium text-[#92c0c9] mb-2">Time Range</label>
            <div className="flex h-10 w-full sm:w-auto items-center justify-center rounded-lg bg-[#234248] p-1">
              {([7, 14, 28] as const).map((days) => (
                <button
                  key={days}
                  onClick={() => setTimeRange(days)}
                  className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    timeRange === days
                      ? 'bg-[#101f22] text-white shadow-sm'
                      : 'text-[#92c0c9] hover:text-white'
                  }`}
                >
                  Last {days} Days
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-col w-full sm:w-auto sm:max-w-xs">
            <label className="text-sm font-medium text-[#92c0c9] mb-2">Category</label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as HabitCategory | 'all')}
                className="input-field w-full appearance-none pr-10"
              >
                <option value="all">All Categories</option>
                {Object.keys(CATEGORY_CONFIG).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="material-symbols-outlined text-[#92c0c9]">expand_more</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#192f33] rounded-xl p-4 text-center">
            <p className="text-3xl font-bold gradient-text">{overallRangeStats.avgCompletion}%</p>
            <p className="text-sm text-[#92c0c9] mt-1">Avg. Completion ({timeRange} days)</p>
          </div>
          <div className="bg-[#192f33] rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-white">{overallRangeStats.totalCompletions}</p>
            <p className="text-sm text-[#92c0c9] mt-1">Total Completions</p>
          </div>
          <div className="bg-[#192f33] rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-[#F5A623]">{overallRangeStats.bestStreak}</p>
            <p className="text-sm text-[#92c0c9] mt-1">Best Streak (days)</p>
          </div>
        </div>

        {/* Habit Progress Cards */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Habit Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHabitsWithStats.map((habit) => {
              return (
                <div
                  key={habit.id}
                  className="flex flex-col rounded-xl bg-[#192f33] p-4"
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-[#92c0c9] text-sm font-medium">{habit.category}</p>
                    <h3 className="text-white text-lg font-bold">
                      {habit.name}
                    </h3>
                  </div>

                  {/* Progress Bars - single row of vertical bars, left-to-right timeline */}
                  <div className="flex items-end gap-0.5 mt-4 mb-2 overflow-hidden">
                    {habit.rangeData.map((day, i) => (
                      <DayBar
                        key={i}
                        completed={day.completed}
                        title={`${day.date}: ${day.completed ? 'Completed' : 'Missed'}`}
                      />
                    ))}
                  </div>

                  {/* X-axis labels */}
                  <div className="flex justify-between text-xs text-[#92c0c9] mb-2">
                    <span>{timeRange}d ago</span>
                    <span>Today</span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-end gap-4 justify-start mt-2">
                    <div className="flex flex-col">
                      <p className="text-[#92c0c9] text-xs">Current Streak</p>
                      <p className="text-white text-base font-bold">
                        {habit.stats.currentStreak} days
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[#92c0c9] text-xs">Completion</p>
                      <p className="text-white text-base font-bold">
                        {habit.rangeStats.completionRate}%
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[#92c0c9] text-xs">Completed</p>
                      <p className="text-white text-base font-bold">
                        {habit.rangeStats.completed}/{habit.rangeStats.total}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredHabitsWithStats.length === 0 && (
              <div className="col-span-2 bg-[#192f33] rounded-xl p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-[#92c0c9] mb-3">trending_up</span>
                <p className="text-white font-medium mb-2">No Habits Yet</p>
                <p className="text-[#92c0c9] text-sm">
                  {selectedCategory === 'all'
                    ? "Create some habits to start tracking your progress!"
                    : "No habits found for the selected category."}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Category Summary */}
        {categorySummaries.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-4">Category Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categorySummaries.map((summary) => (
                <CategorySummaryCard
                  key={summary.category}
                  category={summary.category}
                  avgCompletion={summary.avgCompletion}
                  longestStreak={summary.longestStreak}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </PageShell>
  );
}
