'use client';

import { useState, useMemo } from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { CategorySummaryCard } from '@/components/CategorySummaryCard';
import {
  currentStudent,
  getUserHabits,
  habitCompletions,
  TODAY,
} from '@/lib/mockData';
import { HabitCategory, CATEGORY_CONFIG, Habit, HabitStats } from '@/types/models';

type TimeRange = 7 | 14 | 28;

interface DayCompletion {
  date: Date;
  completed: boolean;
}

/**
 * DayBar - Single vertical bar representing one day's completion status.
 * 
 * DESIGN NOTE: Reverted to original vertical bar design with reduced height
 * for visual lightness. All time ranges (7/14/28 days) use the same bar style
 * in a single horizontal row, left-to-right timeline.
 * 
 * Height reduced from h-12 to h-6 to feel lighter while remaining visible.
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

export default function StudentProgressPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>(28);
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | 'all'>('all');

  const userHabits = getUserHabits(currentStudent.id);

  // Calculate stats based on time range
  const habitsWithStats = useMemo(() => {
    // Use consistent TODAY reference
    const rangeStart = new Date(TODAY);
    rangeStart.setDate(TODAY.getDate() - timeRange);

    return userHabits.map(habit => {
      // Get completions within range
      const completionsInRange = habitCompletions
        .filter(c => {
          if (c.habitId !== habit.id) return false;
          const cDate = new Date(c.date);
          cDate.setHours(0, 0, 0, 0);
          return cDate >= rangeStart && cDate <= TODAY;
        })
        .map(c => {
          const d = new Date(c.date);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        });

      const uniqueCompletions = [...new Set(completionsInRange)].sort((a, b) => a - b);

      // Calculate completion rate for range
      const daysInRange = Math.min(
        timeRange,
        Math.ceil((TODAY.getTime() - habit.startDate.getTime()) / (1000 * 60 * 60 * 24))
      );
      const completionRate = daysInRange > 0 
        ? Math.round((uniqueCompletions.length / daysInRange) * 100) 
        : 0;

      // Calculate current streak
      let currentStreak = 0;
      const checkDate = new Date(TODAY);
      while (true) {
        const hasCompletion = uniqueCompletions.includes(checkDate.getTime());
        if (hasCompletion) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (checkDate.getTime() === TODAY.getTime()) {
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      // Calculate longest streak in range
      let longestStreak = currentStreak;
      let tempStreak = 0;
      for (let i = 0; i < uniqueCompletions.length; i++) {
        if (i === 0) {
          tempStreak = 1;
        } else {
          const diff = (uniqueCompletions[i] - uniqueCompletions[i - 1]) / (1000 * 60 * 60 * 24);
          if (diff === 1) {
            tempStreak++;
          } else {
            tempStreak = 1;
          }
        }
        longestStreak = Math.max(longestStreak, tempStreak);
      }

      // Generate daily completion data for chart
      const dailyData: { date: Date; completed: boolean }[] = [];
      for (let i = timeRange - 1; i >= 0; i--) {
        const date = new Date(TODAY);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        // Only include if after habit start date
        if (date >= habit.startDate) {
          dailyData.push({
            date,
            completed: uniqueCompletions.includes(date.getTime()),
          });
        }
      }

      return {
        habit,
        stats: {
          habitId: habit.id,
          totalDays: daysInRange,
          completedDays: uniqueCompletions.length,
          completionRate,
          currentStreak,
          longestStreak,
          completionsThisWeek: uniqueCompletions.filter(t => t >= TODAY.getTime() - 7 * 24 * 60 * 60 * 1000).length,
          completionsThisMonth: uniqueCompletions.length,
        } as HabitStats,
        dailyData,
      };
    });
  }, [userHabits, timeRange]);

  // Filter by category
  const filteredHabits = selectedCategory === 'all'
    ? habitsWithStats
    : habitsWithStats.filter((h) => h.habit.category === selectedCategory);

  // Calculate category summaries based on time range
  const categorySummaries = useMemo(() => {
    return Object.keys(CATEGORY_CONFIG).map((cat) => {
      const categoryHabits = habitsWithStats.filter((h) => h.habit.category === cat);
      const avgCompletion =
        categoryHabits.length > 0
          ? Math.round(
              categoryHabits.reduce((sum, h) => sum + h.stats.completionRate, 0) /
                categoryHabits.length
            )
          : 0;
      const longestStreak =
        categoryHabits.length > 0
          ? Math.max(...categoryHabits.map((h) => h.stats.longestStreak))
          : 0;
      return {
        category: cat as HabitCategory,
        avgCompletion,
        longestStreak,
        hasHabits: categoryHabits.length > 0,
      };
    }).filter((s) => s.hasHabits);
  }, [habitsWithStats]);

  // Overall stats for the time range
  const overallStats = useMemo(() => {
    if (habitsWithStats.length === 0) {
      return { avgCompletion: 0, totalCompletions: 0, bestStreak: 0 };
    }
    const avgCompletion = Math.round(
      habitsWithStats.reduce((sum, h) => sum + h.stats.completionRate, 0) / habitsWithStats.length
    );
    const totalCompletions = habitsWithStats.reduce((sum, h) => sum + h.stats.completedDays, 0);
    const bestStreak = Math.max(...habitsWithStats.map((h) => h.stats.longestStreak));
    return { avgCompletion, totalCompletions, bestStreak };
  }, [habitsWithStats]);

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
            <p className="text-3xl font-bold gradient-text">{overallStats.avgCompletion}%</p>
            <p className="text-sm text-[#92c0c9] mt-1">Avg. Completion ({timeRange} days)</p>
          </div>
          <div className="bg-[#192f33] rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-white">{overallStats.totalCompletions}</p>
            <p className="text-sm text-[#92c0c9] mt-1">Total Completions</p>
          </div>
          <div className="bg-[#192f33] rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-[#F5A623]">{overallStats.bestStreak}</p>
            <p className="text-sm text-[#92c0c9] mt-1">Best Streak (days)</p>
          </div>
        </div>

        {/* Habit Progress Cards */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Habit Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHabits.map(({ habit, stats, dailyData }) => {
              const config = CATEGORY_CONFIG[habit.category];

              return (
                <div
                  key={habit.id}
                  className="flex flex-col rounded-xl bg-[#192f33] p-4"
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-[#92c0c9] text-sm font-medium">{habit.category}</p>
                    <h3 className="text-white text-lg font-bold hover:text-[#13c8ec] transition-colors cursor-pointer">
                      {habit.name}
                    </h3>
                  </div>

                  {/* Progress Bars - single row of vertical bars, left-to-right timeline */}
                  <div className="flex items-end gap-0.5 mt-4 mb-2">
                    {dailyData.map((day, i) => (
                      <DayBar
                        key={i}
                        completed={day.completed}
                        title={`${day.date.toLocaleDateString()}: ${day.completed ? 'Completed' : 'Missed'}`}
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
                        {stats.currentStreak} days
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[#92c0c9] text-xs">Completion</p>
                      <p className="text-white text-base font-bold">
                        {stats.completionRate}%
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[#92c0c9] text-xs">Completed</p>
                      <p className="text-white text-base font-bold">
                        {stats.completedDays}/{stats.totalDays}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredHabits.length === 0 && (
              <div className="col-span-2 bg-[#192f33] rounded-xl p-8 text-center">
                <p className="text-[#92c0c9]">
                  No habits found for the selected category.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Category Summary */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Category Summary ({timeRange} days)</h2>
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
      </div>
    </PageShell>
  );
}
