'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/Button';
import { HabitForm, HabitFormData } from '@/components/habits/HabitForm';
import { ChallengeCard } from '@/components/challenges/ChallengeCard';
import {
  currentStudent,
  getUserHabits,
  getHabitStats,
  getActiveChallenges,
  getUserChallengeParticipation,
  habitCompletions,
  TODAY,
} from '@/lib/mockData';
import { Habit, HabitStats, CATEGORY_CONFIG, HabitCompletion } from '@/types/models';

// Interactive Habit Row component with local state
function InteractiveHabitRow({
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
  onEdit?: () => void;
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
        {onEdit && (
          <button
            onClick={onEdit}
            className="w-8 h-8 flex items-center justify-center rounded-full text-[#92c0c9] hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Edit habit"
          >
            <span className="material-symbols-outlined !text-lg">edit</span>
          </button>
        )}
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

export default function StudentTodayPage() {
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<string | null>(null);
  const challengesRef = useRef<HTMLDivElement>(null);

  // Local state for habits (starts with mock data)
  const [localHabits, setLocalHabits] = useState<Habit[]>(() => getUserHabits(currentStudent.id));
  
  // Local state for completions (layer on top of mock data)
  const [localCompletions, setLocalCompletions] = useState<Map<string, boolean>>(() => {
    const map = new Map<string, boolean>();
    
    // Initialize from mock completions using consistent TODAY reference
    habitCompletions.forEach(c => {
      const cDate = new Date(c.date);
      cDate.setHours(0, 0, 0, 0);
      if (cDate.getTime() === TODAY.getTime()) {
        map.set(c.habitId, true);
      }
    });
    
    return map;
  });

  const activeChallenges = getActiveChallenges('group-1');
  const participations = getUserChallengeParticipation(currentStudent.id);

  // Calculate stats with local completions overlay
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

    // Get mock completions for this habit
    const mockCompletions = habitCompletions
      .filter(c => c.habitId === habitId)
      .map(c => {
        const d = new Date(c.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      });

    // Add/remove today based on local state
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

    // Calculate current streak
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

    // Calculate longest streak
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

  // Habits with computed stats
  const habitsWithStats = useMemo(() => {
    return localHabits.map(habit => ({
      habit,
      stats: calculateStats(habit.id),
      isCompletedToday: localCompletions.get(habit.id) ?? false,
    }));
  }, [localHabits, localCompletions, calculateStats]);

  // Calculate overall stats
  const { avgCompletion, completedToday, totalHabits } = useMemo(() => {
    const stats = habitsWithStats.map(h => h.stats);
    const avgComp = stats.length > 0
      ? Math.round(stats.reduce((sum, s) => sum + s.completionRate, 0) / stats.length)
      : 0;
    const completed = habitsWithStats.filter(h => h.isCompletedToday).length;
    return { avgCompletion: avgComp, completedToday: completed, totalHabits: habitsWithStats.length };
  }, [habitsWithStats]);

  // Toggle habit completion
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
      id: `habit-new-${Date.now()}`,
      userId: currentStudent.id,
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

  // Scroll to challenges
  const scrollToChallenges = useCallback(() => {
    challengesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <PageShell>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-start gap-3">
          <div className="flex min-w-72 flex-col gap-2">
            <h1 className="text-4xl font-black leading-tight tracking-tight text-white">
              Hello, {currentStudent.name.split(' ')[0]}!
            </h1>
            <p className="text-base text-[#92c0c9]">
              Let&apos;s strive today. You&apos;re doing great!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Habits Column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-white">Today&apos;s Habits</h2>
              <Button
                icon="add_circle"
                onClick={() => setShowHabitForm(true)}
                className="hidden sm:flex"
              >
                New Habit
              </Button>
            </div>

            <div className="flex flex-col gap-4">
              {habitsWithStats.map(({ habit, stats, isCompletedToday }) => (
                <InteractiveHabitRow
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
                    add_task
                  </span>
                  <p className="text-white font-medium mb-2">No habits yet</p>
                  <p className="text-[#92c0c9] text-sm mb-4">
                    Start building healthy habits by creating your first one.
                  </p>
                  <Button onClick={() => setShowHabitForm(true)} icon="add">
                    Create Your First Habit
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-8">
            {/* Summary Card */}
            <SectionCard title="Overall Summary">
              <div className="space-y-3">
                <div className="bg-[#101f22] p-4 rounded-lg flex items-center justify-between">
                  <p className="font-medium text-white">Today&apos;s progress</p>
                  <p className="text-2xl font-bold gradient-text">
                    {completedToday}/{totalHabits}
                  </p>
                </div>
                <div className="bg-[#101f22] p-4 rounded-lg flex items-center justify-between">
                  <p className="font-medium text-white">Consistency this month</p>
                  <p className="text-2xl font-bold gradient-text">{avgCompletion}%</p>
                </div>
              </div>
              <p className="text-sm text-[#92c0c9] mt-4">
                {completedToday === totalHabits && totalHabits > 0
                  ? "🎉 Amazing! You've completed all your habits today!"
                  : "Keep up the momentum to build lasting habits."}
              </p>
            </SectionCard>

            {/* Active Challenges */}
            <div ref={challengesRef} className="scroll-mt-20">
              <SectionCard title="Active Challenges">
                <div className="flex flex-col gap-5">
                  {activeChallenges.map((challenge) => {
                    const participation = participations.find(
                      (p) => p.challengeId === challenge.id
                    );
                    return (
                      <ChallengeCard
                        key={challenge.id}
                        challenge={challenge}
                        participation={participation}
                        compact
                      />
                    );
                  })}
                  {activeChallenges.length === 0 && (
                    <p className="text-[#92c0c9] text-sm">No active challenges right now.</p>
                  )}
                </div>
                <Button
                  variant="secondary"
                  fullWidth
                  className="mt-4"
                  onClick={scrollToChallenges}
                >
                  View All Challenges
                </Button>
              </SectionCard>
            </div>

            {/* XP Progress */}
            <SectionCard title="Your Progress">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#13c8ec] to-[#3b82f6] flex items-center justify-center text-white text-xl font-bold">
                  {currentStudent.level}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Level {currentStudent.level}</p>
                  <p className="text-sm text-[#92c0c9]">{currentStudent.xp} XP</p>
                  <div className="w-full bg-[#325e67] rounded-full h-2 mt-2">
                    <div
                      className="bg-[#13c8ec] h-2 rounded-full"
                      style={{ width: '62%' }}
                    />
                  </div>
                </div>
              </div>
            </SectionCard>
          </aside>
        </div>
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => setShowHabitForm(true)}
        className="sm:hidden fixed bottom-6 right-6 flex items-center justify-center h-14 w-14 bg-gradient-to-br from-[#13c8ec] to-[#3b82f6] text-white rounded-full shadow-lg hover:shadow-[#13c8ec]/40 transition-shadow z-20"
        aria-label="Add new habit"
      >
        <span className="material-symbols-outlined text-2xl">add</span>
      </button>

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
    </PageShell>
  );
}
