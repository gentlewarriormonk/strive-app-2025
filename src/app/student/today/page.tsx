'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { PageShell } from '@/components/layout/PageShell';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/Button';
import { HabitForm, HabitFormData } from '@/components/habits/HabitForm';
import { JoinClassForm } from '@/components/groups/JoinClassForm';
import { Habit, HabitStats, CATEGORY_CONFIG, LEVEL_THRESHOLDS, getXPForNextLevel } from '@/types/models';

interface JoinedGroup {
  id: string;
  name: string;
  teacherName: string;
  memberCount: number;
  joinedAt: string;
}

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
  const { data: session } = useSession();
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<string | null>(null);

  // Get user info from session
  const userName = session?.user?.name || 'Student';
  const userLevel = session?.user?.level ?? 1;
  const userXp = session?.user?.xp ?? 0;

  // Loading state for habits
  const [isLoadingHabits, setIsLoadingHabits] = useState(true);

  // Join class state
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinedGroups, setJoinedGroups] = useState<JoinedGroup[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);

  // Extended habit type with stats from API
  type HabitWithStats = Habit & {
    isCompletedToday: boolean;
    currentStreak: number;
    completionsThisWeek: number;
  };

  // Local state for habits (starts empty, loaded from API)
  const [localHabits, setLocalHabits] = useState<HabitWithStats[]>([]);

  // Fetch habits from API on mount
  useEffect(() => {
    async function fetchHabits() {
      try {
        const response = await fetch('/api/habits');
        if (response.ok) {
          const habits = await response.json();
          // Convert date strings to Date objects
          setLocalHabits(habits.map((h: HabitWithStats & { startDate: string; createdAt: string }) => ({
            ...h,
            startDate: new Date(h.startDate),
            createdAt: new Date(h.createdAt),
          })));
        }
      } catch (error) {
        console.error('Failed to fetch habits:', error);
      } finally {
        setIsLoadingHabits(false);
      }
    }
    fetchHabits();
  }, []);

  // Fetch joined groups on mount
  useEffect(() => {
    async function fetchJoinedGroups() {
      try {
        const response = await fetch('/api/groups/joined');
        if (response.ok) {
          const groups = await response.json();
          setJoinedGroups(groups);
        }
      } catch (error) {
        console.error('Failed to fetch joined groups:', error);
      } finally {
        setIsLoadingGroups(false);
      }
    }
    fetchJoinedGroups();
  }, []);

  // Handle successful join
  const handleJoinSuccess = useCallback((group: { id: string; name: string; teacherName: string }) => {
    setJoinedGroups(prev => [{
      ...group,
      memberCount: 0,
      joinedAt: new Date().toISOString(),
    }, ...prev]);
  }, []);

  // Habits with computed stats from API
  const habitsWithStats = useMemo(() => {
    return localHabits.map(habit => {
      // Calculate completion rate based on this week's completions (out of 7 days)
      const completionRate = Math.round((habit.completionsThisWeek / 7) * 100);

      return {
        habit,
        stats: {
          habitId: habit.id,
          totalDays: Math.max(1, Math.ceil((Date.now() - habit.startDate.getTime()) / (1000 * 60 * 60 * 24))),
          completedDays: habit.completionsThisWeek,
          completionRate,
          currentStreak: habit.currentStreak,
          longestStreak: habit.currentStreak,
          completionsThisWeek: habit.completionsThisWeek,
          completionsThisMonth: 0,
        } as HabitStats,
        isCompletedToday: habit.isCompletedToday,
      };
    });
  }, [localHabits]);

  // Calculate overall stats
  const { avgCompletion, completedToday, totalHabits } = useMemo(() => {
    const stats = habitsWithStats.map(h => h.stats);
    const avgComp = stats.length > 0
      ? Math.round(stats.reduce((sum, s) => sum + s.completionRate, 0) / stats.length)
      : 0;
    const completed = habitsWithStats.filter(h => h.isCompletedToday).length;
    return { avgCompletion: avgComp, completedToday: completed, totalHabits: habitsWithStats.length };
  }, [habitsWithStats]);

  // Toggle habit completion via API
  const toggleHabitCompletion = useCallback(async (habitId: string) => {
    const habit = localHabits.find(h => h.id === habitId);
    if (!habit) return;

    const isCurrentlyCompleted = habit.isCompletedToday;

    // Optimistic update
    setLocalHabits(prev => prev.map(h =>
      h.id === habitId
        ? {
            ...h,
            isCompletedToday: !isCurrentlyCompleted,
            currentStreak: !isCurrentlyCompleted ? h.currentStreak + 1 : Math.max(0, h.currentStreak - 1),
            completionsThisWeek: !isCurrentlyCompleted ? h.completionsThisWeek + 1 : Math.max(0, h.completionsThisWeek - 1),
          }
        : h
    ));

    try {
      const response = await fetch(`/api/habits/${habitId}/complete`, {
        method: isCurrentlyCompleted ? 'DELETE' : 'POST',
      });

      if (!response.ok) {
        // Revert on error
        setLocalHabits(prev => prev.map(h =>
          h.id === habitId
            ? {
                ...h,
                isCompletedToday: isCurrentlyCompleted,
                currentStreak: isCurrentlyCompleted ? h.currentStreak + 1 : Math.max(0, h.currentStreak - 1),
                completionsThisWeek: isCurrentlyCompleted ? h.completionsThisWeek + 1 : Math.max(0, h.completionsThisWeek - 1),
              }
            : h
        ));
        console.error('Failed to toggle completion');
      }
    } catch (error) {
      // Revert on error
      setLocalHabits(prev => prev.map(h =>
        h.id === habitId
          ? {
              ...h,
              isCompletedToday: isCurrentlyCompleted,
              currentStreak: isCurrentlyCompleted ? h.currentStreak + 1 : Math.max(0, h.currentStreak - 1),
              completionsThisWeek: isCurrentlyCompleted ? h.completionsThisWeek + 1 : Math.max(0, h.completionsThisWeek - 1),
            }
          : h
      ));
      console.error('Failed to toggle completion:', error);
    }
  }, [localHabits]);

  // Add new habit via API
  const handleAddHabit = useCallback(async (data: HabitFormData) => {
    const response = await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create habit');
    }

    const newHabit = await response.json();
    // Add to local state with the response from the server
    setLocalHabits(prev => [...prev, {
      ...newHabit,
      startDate: new Date(newHabit.startDate),
      createdAt: new Date(newHabit.createdAt),
      isCompletedToday: false,
      currentStreak: 0,
      completionsThisWeek: 0,
    }]);
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
    <PageShell>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-start gap-3">
          <div className="flex min-w-72 flex-col gap-2">
            <h1 className="text-4xl font-black leading-tight tracking-tight text-white">
              Hello, {userName.split(' ')[0]}!
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
              {isLoadingHabits ? (
                <div className="bg-[#192f33] rounded-xl p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-[#13c8ec] border-t-transparent rounded-full mx-auto mb-3" />
                  <p className="text-[#92c0c9]">Loading your habits...</p>
                </div>
              ) : habitsWithStats.length > 0 ? (
                habitsWithStats.map(({ habit, stats, isCompletedToday }) => (
                  <InteractiveHabitRow
                    key={habit.id}
                    habit={habit}
                    stats={stats}
                    isCompletedToday={isCompletedToday}
                    onToggleComplete={() => toggleHabitCompletion(habit.id)}
                    onEdit={() => setEditingHabit(habit.id)}
                  />
                ))
              ) : (
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

            {/* My Classes - only show if user has joined groups */}
            {!isLoadingGroups && joinedGroups.length > 0 && (
              <SectionCard title="My Classes">
                <div className="space-y-2 mb-4">
                  {joinedGroups.map((group) => (
                    <div
                      key={group.id}
                      className="p-3 bg-[#101f22] rounded-lg hover:bg-[#182a2e] transition-colors"
                    >
                      <p className="text-white font-medium text-sm truncate">{group.name}</p>
                      <p className="text-[#92c0c9] text-xs truncate">
                        {group.teacherName}
                      </p>
                    </div>
                  ))}
                </div>
                <Button
                  variant="secondary"
                  fullWidth
                  icon="group_add"
                  onClick={() => setShowJoinForm(true)}
                >
                  Join Another Class
                </Button>
              </SectionCard>
            )}

            {/* XP Progress */}
            <SectionCard title="Your Progress">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#13c8ec] to-[#3b82f6] flex items-center justify-center text-white text-xl font-bold">
                  {userLevel}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Level {userLevel}</p>
                  <p className="text-sm text-[#92c0c9]">{userXp} XP</p>
                  <div className="w-full bg-[#325e67] rounded-full h-2 mt-2">
                    <div
                      className="bg-[#13c8ec] h-2 rounded-full"
                      style={{
                        width: `${(() => {
                          const nextLevelXp = getXPForNextLevel(userLevel);
                          const currentLevelXp = userLevel > 1 ? getXPForNextLevel(userLevel - 1) : 0;
                          return nextLevelXp > currentLevelXp
                            ? Math.round(((userXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100)
                            : 100;
                        })()}%`
                      }}
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

      {/* Join Class Modal */}
      {showJoinForm && (
        <JoinClassForm
          onClose={() => setShowJoinForm(false)}
          onSuccess={handleJoinSuccess}
        />
      )}
    </PageShell>
  );
}
