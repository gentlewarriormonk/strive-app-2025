'use client';

import { useState, useCallback, useMemo } from 'react';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/Button';
import { HabitForm, HabitFormData } from '@/components/habits/HabitForm';
import { CategorySummaryCard } from '@/components/CategorySummaryCard';
import {
  currentTeacher,
  getUserHabits,
  habitCompletions,
  TODAY,
} from '@/lib/mockData';
import { Habit, HabitCategory, CATEGORY_CONFIG, HabitStats } from '@/types/models';

// Interactive Habit Row for teacher with completion toggle
function TeacherHabitRow({
  habit,
  stats,
  isCompletedToday,
  onToggleComplete,
  onEdit,
}: {
  habit: Habit;
  stats: HabitStats;
  isCompletedToday: boolean;
  onToggleComplete: () => void;
  onEdit: () => void;
}) {
  const categoryConfig = CATEGORY_CONFIG[habit.category];

  return (
    <div className="bg-[#192f33] rounded-xl shadow-sm p-4 flex items-center gap-4 card-hover">
      {/* Category Icon */}
      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${categoryConfig.bgColor}`}>
        <span className={`material-symbols-outlined ${categoryConfig.color}`}>
          {categoryConfig.icon}
        </span>
      </div>

      {/* Habit Info */}
      <div className="flex-1 min-w-0">
        <p className="text-base font-medium text-white truncate">{habit.name}</p>
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-[#92c0c9] mt-1">
          {stats.currentStreak > 0 && (
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined !text-base text-[#F5A623]">
                local_fire_department
              </span>
              <span>{stats.currentStreak}-day streak</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined !text-base">donut_small</span>
            <span>{stats.completionsThisWeek}/7 this week</span>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-xs ${
            habit.visibility === 'PUBLIC_TO_CLASS' 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-gray-500/20 text-gray-400'
          }`}>
            {habit.visibility === 'PUBLIC_TO_CLASS' ? 'Shared' : 'Private'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isCompletedToday}
          onChange={onToggleComplete}
          className="habit-checkbox"
          aria-label={`Mark ${habit.name} as ${isCompletedToday ? 'incomplete' : 'complete'}`}
        />
        <button
          onClick={onEdit}
          className="w-8 h-8 flex items-center justify-center rounded-full text-[#92c0c9] hover:bg-white/10 hover:text-white transition-colors"
          aria-label="Edit habit"
        >
          <span className="material-symbols-outlined !text-lg">edit</span>
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full text-[#92c0c9]/40 cursor-not-allowed"
          aria-label="More options"
          aria-disabled="true"
          title="Coming soon"
        >
          <span className="material-symbols-outlined !text-lg">more_vert</span>
        </button>
      </div>
    </div>
  );
}

export default function TeacherHabitsPage() {
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<string | null>(null);
  
  // Local state for habits
  const [localHabits, setLocalHabits] = useState<Habit[]>(() => 
    getUserHabits(currentTeacher.id)
  );
  
  // Local state for completions
  const [localCompletions, setLocalCompletions] = useState<Map<string, boolean>>(() => {
    const map = new Map<string, boolean>();
    
    habitCompletions.forEach(c => {
      const cDate = new Date(c.date);
      cDate.setHours(0, 0, 0, 0);
      if (cDate.getTime() === TODAY.getTime()) {
        map.set(c.habitId, true);
      }
    });
    
    return map;
  });

  // Calculate stats with local completions
  const calculateStats = useCallback((habitId: string): HabitStats => {
    const habit = localHabits.find(h => h.id === habitId);
    if (!habit) {
      return {
        habitId,
        totalDays: 0,
        completedDays: 0,
        completionRate: 0,
        currentStreak: 0,
        longestStreak: 0,
        completionsThisWeek: 0,
        completionsThisMonth: 0,
      };
    }

    // Use consistent TODAY reference
    const todayTime = TODAY.getTime();
    
    const startOfWeek = new Date(TODAY);
    startOfWeek.setDate(TODAY.getDate() - TODAY.getDay());
    
    const startOfMonth = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1);

    const mockCompletions = habitCompletions
      .filter(c => c.habitId === habitId)
      .map(c => {
        const d = new Date(c.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      });

    const isCompletedToday = localCompletions.get(habitId) ?? false;
    
    let allCompletionTimes = [...new Set(mockCompletions)];
    if (isCompletedToday && !allCompletionTimes.includes(todayTime)) {
      allCompletionTimes.push(todayTime);
    } else if (!isCompletedToday) {
      allCompletionTimes = allCompletionTimes.filter(t => t !== todayTime);
    }
    allCompletionTimes.sort((a, b) => a - b);

    const totalDays = Math.ceil((todayTime - habit.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const completedDays = allCompletionTimes.length;
    const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

    let currentStreak = 0;
    const checkDate = new Date(TODAY);
    while (true) {
      const hasCompletion = allCompletionTimes.includes(checkDate.getTime());
      if (hasCompletion) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (checkDate.getTime() === todayTime) {
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    let longestStreak = currentStreak;
    let tempStreak = 0;
    for (let i = 0; i < allCompletionTimes.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const diff = (allCompletionTimes[i] - allCompletionTimes[i - 1]) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    const completionsThisWeek = allCompletionTimes.filter(t => t >= startOfWeek.getTime()).length;
    const completionsThisMonth = allCompletionTimes.filter(t => t >= startOfMonth.getTime()).length;

    return {
      habitId,
      totalDays,
      completedDays,
      completionRate,
      currentStreak,
      longestStreak,
      completionsThisWeek,
      completionsThisMonth,
    };
  }, [localHabits, localCompletions]);

  // Habits with stats
  const habitsWithStats = useMemo(() => {
    return localHabits.map(habit => ({
      habit,
      stats: calculateStats(habit.id),
      isCompletedToday: localCompletions.get(habit.id) ?? false,
    }));
  }, [localHabits, localCompletions, calculateStats]);

  // Overall stats
  const { avgCompletion, bestStreak, completedToday, totalHabits } = useMemo(() => {
    const stats = habitsWithStats.map(h => h.stats);
    const avgComp = stats.length > 0
      ? Math.round(stats.reduce((sum, s) => sum + s.completionRate, 0) / stats.length)
      : 0;
    const best = stats.length > 0 ? Math.max(...stats.map(s => s.longestStreak)) : 0;
    const completed = habitsWithStats.filter(h => h.isCompletedToday).length;
    return { avgCompletion: avgComp, bestStreak: best, completedToday: completed, totalHabits: habitsWithStats.length };
  }, [habitsWithStats]);

  // Category breakdown
  const categorySummaries = useMemo(() => {
    return Object.keys(CATEGORY_CONFIG)
      .map((cat) => {
        const categoryHabits = habitsWithStats.filter((h) => h.habit.category === cat);
        const avgCatCompletion =
          categoryHabits.length > 0
            ? Math.round(
                categoryHabits.reduce((sum, h) => sum + h.stats.completionRate, 0) /
                  categoryHabits.length
              )
            : 0;
        const longestCatStreak =
          categoryHabits.length > 0
            ? Math.max(...categoryHabits.map((h) => h.stats.longestStreak))
            : 0;
        return {
          category: cat as HabitCategory,
          avgCompletion: avgCatCompletion,
          longestStreak: longestCatStreak,
          hasHabits: categoryHabits.length > 0,
        };
      })
      .filter((s) => s.hasHabits);
  }, [habitsWithStats]);

  // Toggle completion
  const toggleHabitCompletion = useCallback((habitId: string) => {
    setLocalCompletions(prev => {
      const newMap = new Map(prev);
      newMap.set(habitId, !prev.get(habitId));
      return newMap;
    });
  }, []);

  // Add new habit
  const handleAddHabit = useCallback((data: HabitFormData) => {
    const newHabit: Habit = {
      id: `habit-teacher-${Date.now()}`,
      userId: currentTeacher.id,
      name: data.name,
      description: data.description,
      category: data.category,
      visibility: data.visibility,
      scheduleFrequency: data.scheduleFrequency,
      scheduleDays: data.scheduleDays,
      startDate: new Date(data.startDate),
      isActive: true,
      createdAt: new Date(),
    };
    setLocalHabits(prev => [...prev, newHabit]);
  }, []);

  // Edit habit
  const handleEditHabit = useCallback((data: HabitFormData) => {
    if (!editingHabit) return;
    setLocalHabits(prev => prev.map(h => 
      h.id === editingHabit 
        ? { ...h, name: data.name, description: data.description, category: data.category, visibility: data.visibility, scheduleFrequency: data.scheduleFrequency, scheduleDays: data.scheduleDays }
        : h
    ));
  }, [editingHabit]);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">My Habits</h1>
          <p className="text-[#92c0c9] text-base">
            Track your own wellbeing habits and lead by example.
          </p>
        </div>
        <Button icon="add_circle" onClick={() => setShowHabitForm(true)}>
          New Habit
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Habits List */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Today&apos;s Habits</h2>
            <span className="text-sm text-[#92c0c9]">
              {completedToday}/{totalHabits} completed
            </span>
          </div>
          <div className="flex flex-col gap-4">
            {habitsWithStats.map(({ habit, stats, isCompletedToday }) => (
              <TeacherHabitRow
                key={habit.id}
                habit={habit}
                stats={stats}
                isCompletedToday={isCompletedToday}
                onToggleComplete={() => toggleHabitCompletion(habit.id)}
                onEdit={() => setEditingHabit(habit.id)}
              />
            ))}

            {habitsWithStats.length === 0 && (
              <div className="bg-[#192f33] rounded-xl p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-[#92c0c9] mb-3">
                  self_improvement
                </span>
                <p className="text-white font-medium mb-2">No habits yet</p>
                <p className="text-[#92c0c9] text-sm mb-4">
                  Start tracking your own wellbeing habits to lead by example.
                </p>
                <Button onClick={() => setShowHabitForm(true)} icon="add">
                  Create Your First Habit
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-6">
          {/* Stats Card */}
          <SectionCard title="Your Stats">
            <div className="space-y-4">
              <div className="bg-[#101f22] p-4 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-[#92c0c9] text-xs">Average Completion</p>
                  <p className="text-2xl font-bold gradient-text">{avgCompletion}%</p>
                </div>
                <span className="material-symbols-outlined text-3xl text-[#13c8ec]/30">
                  trending_up
                </span>
              </div>
              <div className="bg-[#101f22] p-4 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-[#92c0c9] text-xs">Best Streak</p>
                  <p className="text-2xl font-bold text-[#F5A623]">{bestStreak} days</p>
                </div>
                <span className="material-symbols-outlined text-3xl text-[#F5A623]/30">
                  local_fire_department
                </span>
              </div>
              <div className="bg-[#101f22] p-4 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-[#92c0c9] text-xs">Level</p>
                  <p className="text-2xl font-bold text-white">{currentTeacher.level}</p>
                </div>
                <span className="material-symbols-outlined text-3xl text-white/30">
                  military_tech
                </span>
              </div>
            </div>
          </SectionCard>

          {/* Sharing Info */}
          <SectionCard>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#13c8ec]">visibility</span>
              <div>
                <p className="text-white font-medium mb-1">Visible to Students</p>
                <p className="text-[#92c0c9] text-sm">
                  Habits marked as &quot;Public to group&quot; will be visible to your students,
                  showing them you&apos;re walking the walk.
                </p>
              </div>
            </div>
          </SectionCard>
        </aside>
      </div>

      {/* Category Breakdown */}
      {categorySummaries.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold text-white mb-4">Category Breakdown</h2>
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

      {/* Habit Form Modal - New */}
      {showHabitForm && (
        <HabitForm
          onClose={() => setShowHabitForm(false)}
          onSubmit={handleAddHabit}
        />
      )}

      {/* Habit Form Modal - Edit */}
      {editingHabit && (
        <HabitForm
          onClose={() => setEditingHabit(null)}
          initialData={
            localHabits.find((h) => h.id === editingHabit)
              ? {
                  name: localHabits.find((h) => h.id === editingHabit)!.name,
                  description: localHabits.find((h) => h.id === editingHabit)!.description || '',
                  category: localHabits.find((h) => h.id === editingHabit)!.category,
                  visibility: localHabits.find((h) => h.id === editingHabit)!.visibility,
                  scheduleFrequency: localHabits.find((h) => h.id === editingHabit)!.scheduleFrequency,
                  scheduleDays: localHabits.find((h) => h.id === editingHabit)!.scheduleDays || [],
                  startDate: localHabits
                    .find((h) => h.id === editingHabit)!
                    .startDate.toISOString()
                    .split('T')[0],
                }
              : undefined
          }
          onSubmit={handleEditHabit}
        />
      )}
    </div>
  );
}
