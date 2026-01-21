'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { HabitForm, HabitFormData } from '@/components/habits/HabitForm';
import { WeeklyDots } from '@/components/habits/WeeklyDots';
import { ImplementationIntention } from '@/components/habits/ImplementationIntention';
import { Habit, getCategoryConfig } from '@/types/models';

interface JoinedGroup {
  id: string;
  name: string;
}

// Get time-based greeting
function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// Get motivational message based on completion status
function getMotivationalMessage(completedToday: number, totalHabits: number): string {
  if (totalHabits === 0) return "Ready to build some habits?";
  if (completedToday === totalHabits) return "You've completed all your habits today!";
  if (completedToday === 0) return "Let's get started on today's habits.";
  if (completedToday < totalHabits / 2) return "You're making progress. Keep going!";
  return "Almost there! Just a few more to go.";
}

// Teacher Habit Row with weekly dots and implementation intention
function TeacherHabitRow({
  habit,
  isCompletedToday,
  currentStreak,
  weeklyCompletions,
  todayIndex,
  implementationIntention,
  onToggleComplete,
  onEdit,
  onDelete,
}: {
  habit: Habit;
  isCompletedToday: boolean;
  currentStreak: number;
  weeklyCompletions: boolean[];
  todayIndex: number;
  implementationIntention?: string;
  onToggleComplete: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const categoryConfig = getCategoryConfig(habit.category);

  return (
    <div className="bg-[#192f33] rounded-xl shadow-sm overflow-hidden card-hover">
      <div className="p-4 flex items-start gap-4">
        {/* Category Icon */}
        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${categoryConfig.bgColor} flex-shrink-0`}>
          <span className={`material-symbols-outlined ${categoryConfig.color}`}>
            {categoryConfig.icon}
          </span>
        </div>

        {/* Habit Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-base font-medium text-white truncate">{habit.name}</p>
            {/* Shared badge */}
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              habit.visibility === 'PUBLIC_TO_CLASS'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-gray-500/20 text-gray-400'
            }`}>
              {habit.visibility === 'PUBLIC_TO_CLASS' ? 'Shared' : 'Private'}
            </span>
          </div>

          {/* Weekly dots + streak */}
          <div className="flex items-center gap-4 mt-2">
            <WeeklyDots completions={weeklyCompletions} todayIndex={todayIndex} size="sm" />
            {currentStreak > 0 && (
              <div className="flex items-center gap-1 text-xs text-[#92c0c9]">
                <span className="material-symbols-outlined !text-sm text-[#F5A623]">
                  local_fire_department
                </span>
                <span>{currentStreak}</span>
              </div>
            )}
          </div>

          {/* Implementation intention (collapsed by default, hidden after completion) */}
          {implementationIntention && !isCompletedToday && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-left w-full"
            >
              {expanded ? (
                <ImplementationIntention intention={implementationIntention} />
              ) : (
                <p className="text-[#92c0c9]/60 text-xs italic truncate hover:text-[#92c0c9]/80 transition-colors">
                  &ldquo;{implementationIntention.substring(0, 50)}...&rdquo;
                </p>
              )}
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <input
            type="checkbox"
            checked={isCompletedToday}
            onChange={onToggleComplete}
            className="habit-checkbox"
            aria-label={`Mark ${habit.name} as ${isCompletedToday ? 'incomplete' : 'complete'}`}
          />
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 flex items-center justify-center rounded-full text-[#92c0c9] hover:bg-white/10 hover:text-white transition-colors"
              aria-label="More options"
            >
              <span className="material-symbols-outlined !text-lg">more_vert</span>
            </button>
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-50 bg-[#1a2f33] border border-white/10 rounded-lg shadow-lg py-1 min-w-[140px]">
                  {onEdit && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onEdit();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined !text-lg">edit</span>
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/10 flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined !text-lg">delete</span>
                      Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Extended habit type with stats from API
type HabitWithStats = Habit & {
  isCompletedToday: boolean;
  currentStreak: number;
  completionsThisWeek: number;
  weeklyCompletions: boolean[];
  todayIndex: number;
  implementationIntention?: string;
};

export default function TeacherHabitsPage() {
  const { data: session } = useSession();
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<string | null>(null);

  // Get user info from session
  const userName = session?.user?.name || 'Teacher';

  // Loading state for habits
  const [isLoadingHabits, setIsLoadingHabits] = useState(true);

  // Local state for habits (starts empty, loaded from API)
  const [localHabits, setLocalHabits] = useState<HabitWithStats[]>([]);

  // Groups the teacher has (for "Shared with" display)
  const [teacherGroups, setTeacherGroups] = useState<JoinedGroup[]>([]);

  // Fetch habits from API on mount
  useEffect(() => {
    async function fetchHabits() {
      try {
        const response = await fetch('/api/habits');
        if (response.ok) {
          const habits = await response.json();
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

  // Fetch teacher's groups on mount (for "Shared with" display)
  useEffect(() => {
    async function fetchGroups() {
      try {
        const response = await fetch('/api/groups');
        if (response.ok) {
          const groups = await response.json();
          setTeacherGroups(groups.map((g: { id: string; name: string }) => ({ id: g.id, name: g.name })));
        }
      } catch (error) {
        console.error('Failed to fetch groups:', error);
      }
    }
    fetchGroups();
  }, []);

  // Calculate overall stats
  const { completedToday, totalHabits, totalCompletionsThisWeek, totalCompletionsAllTime } = useMemo(() => {
    const completed = localHabits.filter(h => h.isCompletedToday).length;
    const weekTotal = localHabits.reduce((sum, h) => sum + h.completionsThisWeek, 0);
    // Estimate all-time based on current streak and this week's data (API doesn't return all-time yet)
    const allTime = localHabits.reduce((sum, h) => sum + h.currentStreak + h.completionsThisWeek, 0);
    return {
      completedToday: completed,
      totalHabits: localHabits.length,
      totalCompletionsThisWeek: weekTotal,
      totalCompletionsAllTime: allTime,
    };
  }, [localHabits]);

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
            weeklyCompletions: h.weeklyCompletions.map((c, i) =>
              i === h.todayIndex ? !isCurrentlyCompleted : c
            ),
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
                weeklyCompletions: h.weeklyCompletions.map((c, i) =>
                  i === h.todayIndex ? isCurrentlyCompleted : c
                ),
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
              weeklyCompletions: h.weeklyCompletions.map((c, i) =>
                i === h.todayIndex ? isCurrentlyCompleted : c
              ),
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
    setLocalHabits(prev => [...prev, {
      ...newHabit,
      startDate: new Date(newHabit.startDate),
      createdAt: new Date(newHabit.createdAt),
      isCompletedToday: false,
      currentStreak: 0,
      completionsThisWeek: 0,
      weeklyCompletions: [false, false, false, false, false, false, false],
      todayIndex: new Date().getDay() === 0 ? 6 : new Date().getDay() - 1,
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

  // Delete habit via API
  const handleDeleteHabit = useCallback(async (habitId: string) => {
    if (!confirm('Are you sure you want to delete this habit? This cannot be undone.')) {
      return;
    }

    const previousHabits = localHabits;
    setLocalHabits(prev => prev.filter(h => h.id !== habitId));

    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        setLocalHabits(previousHabits);
        console.error('Failed to delete habit');
      }
    } catch (error) {
      setLocalHabits(previousHabits);
      console.error('Failed to delete habit:', error);
    }
  }, [localHabits]);

  // Get shared groups names for display
  const sharedGroupsText = useMemo(() => {
    if (teacherGroups.length === 0) return null;
    if (teacherGroups.length === 1) return teacherGroups[0].name;
    if (teacherGroups.length === 2) return `${teacherGroups[0].name} and ${teacherGroups[1].name}`;
    return `${teacherGroups[0].name}, ${teacherGroups[1].name}, and ${teacherGroups.length - 2} more`;
  }, [teacherGroups]);

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-8">
        {/* Header - Time-based greeting + completion status */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-white">
            {getTimeBasedGreeting()}, {userName.split(' ')[0]}
          </h1>
          <p className="text-base text-[#92c0c9]">
            {getMotivationalMessage(completedToday, totalHabits)}
          </p>
          {totalHabits > 0 && (
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold gradient-text">{completedToday}/{totalHabits}</span>
                <span className="text-sm text-[#92c0c9]">today</span>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-white">{totalCompletionsThisWeek}</span>
                <span className="text-sm text-[#92c0c9]">this week</span>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/habits/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#13c8ec] text-[#101f22] font-bold hover:bg-[#0ea5c7] transition-colors text-sm"
          >
            <span className="material-symbols-outlined !text-lg">auto_awesome</span>
            Design a Habit
          </Link>
          <Button
            variant="secondary"
            icon="add"
            onClick={() => setShowHabitForm(true)}
          >
            Quick Add
          </Button>
        </div>

        {/* Habits List */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-white">Today&apos;s Habits</h2>

          {isLoadingHabits ? (
            <div className="bg-[#192f33] rounded-xl p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-[#13c8ec] border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-[#92c0c9]">Loading your habits...</p>
            </div>
          ) : localHabits.length > 0 ? (
            <div className="flex flex-col gap-3">
              {localHabits.map((habit) => (
                <TeacherHabitRow
                  key={habit.id}
                  habit={habit}
                  isCompletedToday={habit.isCompletedToday}
                  currentStreak={habit.currentStreak}
                  weeklyCompletions={habit.weeklyCompletions}
                  todayIndex={habit.todayIndex}
                  implementationIntention={habit.implementationIntention}
                  onToggleComplete={() => toggleHabitCompletion(habit.id)}
                  onEdit={() => setEditingHabit(habit.id)}
                  onDelete={() => handleDeleteHabit(habit.id)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-[#192f33] rounded-xl p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-[#92c0c9] mb-3">
                self_improvement
              </span>
              <p className="text-white font-medium mb-2">No habits yet</p>
              <p className="text-[#92c0c9] text-sm mb-6">
                Start tracking your own wellbeing habits to lead by example for your students.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/habits/new"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#13c8ec] text-[#101f22] font-bold hover:bg-[#0ea5c7] transition-colors"
                >
                  <span className="material-symbols-outlined !text-lg">auto_awesome</span>
                  Design a Habit That Sticks
                </Link>
                <button
                  onClick={() => setShowHabitForm(true)}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors"
                >
                  <span className="material-symbols-outlined !text-lg">add</span>
                  Quick Add
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Journey Preview Card */}
        {localHabits.length > 0 && (
          <div className="bg-[#192f33] rounded-xl p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#13c8ec]/20 to-[#3b82f6]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#13c8ec]">trending_up</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">Your Journey</p>
                <p className="text-[#92c0c9] text-sm">
                  {totalCompletionsAllTime} completions and counting
                </p>
                {sharedGroupsText && localHabits.some(h => h.visibility === 'PUBLIC_TO_CLASS') && (
                  <p className="text-[#92c0c9]/70 text-xs mt-1">
                    <span className="material-symbols-outlined !text-xs align-middle mr-1">visibility</span>
                    Shared with: {sharedGroupsText}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Visibility Info */}
        {localHabits.length > 0 && localHabits.some(h => h.visibility === 'PUBLIC_TO_CLASS') && (
          <div className="flex items-start gap-3 p-4 bg-[#192f33]/50 rounded-lg border border-[#325e67]">
            <span className="material-symbols-outlined text-[#13c8ec] mt-0.5">visibility</span>
            <div>
              <p className="text-white font-medium text-sm mb-1">Visible to Students</p>
              <p className="text-[#92c0c9] text-xs">
                Habits marked as &quot;Shared&quot; are visible to your students,
                showing them you&apos;re walking the walk.
              </p>
            </div>
          </div>
        )}
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
    </div>
  );
}
