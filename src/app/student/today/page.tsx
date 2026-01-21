'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { QuickAddForm, QuickAddData } from '@/components/habits/QuickAddForm';
import { EditHabitForm, EditHabitData } from '@/components/habits/EditHabitForm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { JoinClassForm } from '@/components/groups/JoinClassForm';
import { WeeklyDots } from '@/components/habits/WeeklyDots';
import { PrivacyIndicator } from '@/components/habits/PrivacyIndicator';
import { ImplementationIntention } from '@/components/habits/ImplementationIntention';
import { Habit, getCategoryConfig } from '@/types/models';

interface JoinedGroup {
  id: string;
  name: string;
  teacherName: string;
  memberCount: number;
  joinedAt: string;
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

// Interactive Habit Row component with weekly dots and implementation intention
function InteractiveHabitRow({
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
  const [expanded, setExpanded] = useState(false);
  const categoryConfig = getCategoryConfig(habit.category);

  const menuItems = [
    ...(onEdit ? [{ label: 'Edit', icon: 'edit', onClick: onEdit }] : []),
    ...(onDelete ? [{ label: 'Delete', icon: 'delete', onClick: onDelete, variant: 'danger' as const }] : []),
  ];

  return (
    <div className="bg-[#192f33] rounded-xl shadow-sm overflow-hidden card-hover">
      {/* Main row */}
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
            <PrivacyIndicator visibility={habit.visibility === 'PRIVATE_TO_PEERS' ? 'teacher_only' : habit.visibility === 'PUBLIC_TO_CLASS' ? 'public' : 'private'} />
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

          {/* Implementation intention (collapsed by default) */}
          {implementationIntention && (
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
          <DropdownMenu items={menuItems} />
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

export default function StudentTodayPage() {
  const { data: session } = useSession();
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<string | null>(null);
  const [deletingHabit, setDeletingHabit] = useState<{ id: string; name: string } | null>(null);

  // Get user info from session
  const userName = session?.user?.name || 'Student';

  // Loading state for habits
  const [isLoadingHabits, setIsLoadingHabits] = useState(true);

  // Join group state
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinedGroups, setJoinedGroups] = useState<JoinedGroup[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);

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

  // Calculate overall stats
  const { completedToday, totalHabits, totalCompletionsThisWeek } = useMemo(() => {
    const completed = localHabits.filter(h => h.isCompletedToday).length;
    const weekTotal = localHabits.reduce((sum, h) => sum + h.completionsThisWeek, 0);
    return {
      completedToday: completed,
      totalHabits: localHabits.length,
      totalCompletionsThisWeek: weekTotal
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

  // Add new habit via API (Quick Add)
  const handleAddHabit = useCallback(async (data: QuickAddData) => {
    const response = await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        visibility: data.visibility,
        category: 'Other',
        scheduleFrequency: 'DAILY',
      }),
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
      weeklyCompletions: [false, false, false, false, false, false, false],
      todayIndex: new Date().getDay() === 0 ? 6 : new Date().getDay() - 1,
    }]);
  }, []);

  // Edit habit via API
  const handleEditHabit = useCallback(async (data: EditHabitData) => {
    if (!editingHabit) return;

    const response = await fetch(`/api/habits/${editingHabit}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update habit');
    }

    setLocalHabits(prev => prev.map(h =>
      h.id === editingHabit
        ? {
            ...h,
            name: data.name,
            cue: data.cue,
            location: data.location,
            obstacle: data.obstacle,
            backupPlan: data.backupPlan,
            visibility: data.visibility,
            scheduleFrequency: data.scheduleFrequency,
            scheduleDays: data.scheduleDays
          }
        : h
    ));
  }, [editingHabit]);

  // Initiate delete (show confirmation dialog)
  const initiateDelete = useCallback((habitId: string, habitName: string) => {
    setDeletingHabit({ id: habitId, name: habitName });
  }, []);

  // Confirm delete habit via API
  const confirmDeleteHabit = useCallback(async () => {
    if (!deletingHabit) return;

    const habitId = deletingHabit.id;
    const previousHabits = localHabits;

    // Optimistic update
    setLocalHabits(prev => prev.filter(h => h.id !== habitId));
    setDeletingHabit(null);

    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        // Revert on error
        setLocalHabits(previousHabits);
        console.error('Failed to delete habit');
      }
    } catch (error) {
      // Revert on error
      setLocalHabits(previousHabits);
      console.error('Failed to delete habit:', error);
    }
  }, [deletingHabit, localHabits]);

  return (
    <PageShell>
      <div className="flex flex-col gap-8 max-w-3xl mx-auto">
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
          {!isLoadingGroups && joinedGroups.length === 0 && (
            <Button
              variant="secondary"
              icon="group_add"
              onClick={() => setShowJoinForm(true)}
            >
              Join a Group
            </Button>
          )}
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
                <InteractiveHabitRow
                  key={habit.id}
                  habit={habit}
                  isCompletedToday={habit.isCompletedToday}
                  currentStreak={habit.currentStreak}
                  weeklyCompletions={habit.weeklyCompletions}
                  todayIndex={habit.todayIndex}
                  implementationIntention={habit.implementationIntention}
                  onToggleComplete={() => toggleHabitCompletion(habit.id)}
                  onEdit={() => setEditingHabit(habit.id)}
                  onDelete={() => initiateDelete(habit.id, habit.name)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-[#192f33] rounded-xl p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-[#92c0c9] mb-3">
                add_task
              </span>
              <p className="text-white font-medium mb-2">No habits yet</p>
              <p className="text-[#92c0c9] text-sm mb-6">
                Start building healthy habits by creating your first one.
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
          <Link
            href="/student/progress"
            className="bg-[#192f33] rounded-xl p-5 hover:bg-[#1a3538] transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#13c8ec]/20 to-[#3b82f6]/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#13c8ec]">trending_up</span>
                </div>
                <div>
                  <p className="text-white font-semibold">View Your Journey</p>
                  <p className="text-[#92c0c9] text-sm">See your progress and streaks over time</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#92c0c9] group-hover:text-white group-hover:translate-x-1 transition-all">
                arrow_forward
              </span>
            </div>
          </Link>
        )}

        {/* Groups Section */}
        {!isLoadingGroups && joinedGroups.length > 0 && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">My Groups</h2>
              <button
                onClick={() => setShowJoinForm(true)}
                className="text-[#13c8ec] hover:text-[#0ea5c7] text-sm font-medium transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined !text-sm">add</span>
                Join another
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {joinedGroups.map((group) => (
                <div
                  key={group.id}
                  className="px-4 py-2 bg-[#192f33] rounded-lg border border-white/10"
                >
                  <p className="text-white text-sm font-medium">{group.name}</p>
                  <p className="text-[#92c0c9] text-xs">{group.teacherName}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Quick Add Modal */}
      {showHabitForm && (
        <QuickAddForm
          onClose={() => setShowHabitForm(false)}
          onSubmit={handleAddHabit}
        />
      )}

      {/* Edit Habit Modal */}
      {editingHabit && localHabits.find((h) => h.id === editingHabit) && (
        <EditHabitForm
          onClose={() => setEditingHabit(null)}
          initialData={{
            id: editingHabit,
            name: localHabits.find((h) => h.id === editingHabit)!.name,
            cue: localHabits.find((h) => h.id === editingHabit)!.cue,
            location: localHabits.find((h) => h.id === editingHabit)!.location,
            obstacle: localHabits.find((h) => h.id === editingHabit)!.obstacle,
            backupPlan: localHabits.find((h) => h.id === editingHabit)!.backupPlan,
            visibility: localHabits.find((h) => h.id === editingHabit)!.visibility,
            scheduleFrequency: localHabits.find((h) => h.id === editingHabit)!.scheduleFrequency,
            scheduleDays: localHabits.find((h) => h.id === editingHabit)!.scheduleDays || [],
          }}
          onSubmit={handleEditHabit}
          onDelete={() => {
            const habit = localHabits.find((h) => h.id === editingHabit);
            if (habit) {
              setEditingHabit(null);
              initiateDelete(habit.id, habit.name);
            }
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingHabit}
        title="Delete Habit?"
        message={`Are you sure you want to delete "${deletingHabit?.name}"?`}
        subtext="Your completion history will be preserved, but this habit won't appear in your daily list anymore."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={confirmDeleteHabit}
        onCancel={() => setDeletingHabit(null)}
      />

      {/* Join Group Modal */}
      {showJoinForm && (
        <JoinClassForm
          onClose={() => setShowJoinForm(false)}
          onSuccess={handleJoinSuccess}
        />
      )}
    </PageShell>
  );
}
