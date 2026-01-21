'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SectionCard } from '@/components/ui/SectionCard';
import { MiniWeekDots } from '@/components/habits/WeeklyDots';
import { getCategoryConfig, HabitCategory } from '@/types/models';

interface HabitData {
  id: string;
  name: string;
  category: HabitCategory;
  visibility: string;
  currentStreak: number;
  completionsThisWeek: number;
  weeklyCompletions: boolean[];
  needsAttention: boolean;
  implementationIntention?: string;
}

interface PrivateHabitData {
  id: string;
  needsAttention: boolean;
}

interface StudentData {
  student: {
    id: string;
    name: string;
    email: string | null;
    image: string | null;
    xp: number;
    level: number;
  };
  group: {
    id: string;
    name: string;
  };
  stats: {
    totalCompletionsAllTime: number;
    totalCompletionsThisWeek: number;
    bestStreak: number;
    activeHabits: number;
  };
  todayIndex: number;
  weeklyAggregate: boolean[];
  habitsNeedingAttention: HabitData[];
  habitsOnTrack: HabitData[];
  privateHabits: PrivateHabitData[];
  teacherNote: string;
}

// Get identity message based on total completions
function getIdentityMessage(totalCompletions: number): string {
  if (totalCompletions === 0) return "Just getting started";
  if (totalCompletions < 10) return "Building the foundation";
  if (totalCompletions < 25) return "Finding their rhythm";
  if (totalCompletions < 50) return "Consistency is taking shape";
  if (totalCompletions < 100) return "Habits are becoming identity";
  return "A master of their own growth";
}

// Days of week labels
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// Weekly dots component for student overview
function StudentWeeklyDots({
  completions,
  todayIndex,
}: {
  completions: boolean[];
  todayIndex: number;
}) {
  return (
    <div className="flex items-center gap-2">
      {DAYS.map((day, i) => {
        const isToday = i === todayIndex;
        const isFuture = i > todayIndex;
        const completed = completions[i];

        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="text-[#92c0c9] text-xs">{day}</span>
            <div
              className={`w-4 h-4 rounded-full ${
                isFuture
                  ? 'bg-[#325e67]'
                  : completed
                  ? 'bg-[#13c8ec]'
                  : 'bg-[#325e67]'
              } ${isToday ? 'ring-2 ring-white/30' : ''}`}
            />
          </div>
        );
      })}
    </div>
  );
}

export default function TeacherStudentDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const studentId = params.id as string;
  const groupId = searchParams.get('groupId');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<StudentData | null>(null);

  // Teacher notes state
  const [noteText, setNoteText] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);

  // Fetch student data
  useEffect(() => {
    async function fetchStudentData() {
      try {
        const url = groupId
          ? `/api/teacher/student/${studentId}?groupId=${groupId}`
          : `/api/teacher/student/${studentId}`;
        const response = await fetch(url);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Student not found');
          } else if (response.status === 403) {
            setError('Access denied');
          } else {
            setError('Failed to load student data');
          }
          return;
        }
        const studentData = await response.json();
        setData(studentData);
        setNoteText(studentData.teacherNote || '');
      } catch (err) {
        console.error('Failed to fetch student data:', err);
        setError('Failed to load student data');
      } finally {
        setIsLoading(false);
      }
    }

    if (studentId) {
      fetchStudentData();
    }
  }, [studentId, groupId]);

  // Save teacher note
  const saveNote = useCallback(async () => {
    if (!data) return;

    setIsSavingNote(true);
    try {
      const response = await fetch('/api/teacher/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: data.student.id,
          groupId: data.group.id,
          noteText,
        }),
      });

      if (response.ok) {
        setNoteSaved(true);
        setTimeout(() => setNoteSaved(false), 2000);
      }
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setIsSavingNote(false);
    }
  }, [data, noteText]);

  // Loading state
  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#13c8ec] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-[#92c0c9]">Loading student data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <span className="material-symbols-outlined text-4xl text-red-400 mb-4">error</span>
            <p className="text-white font-medium mb-2">Something went wrong</p>
            <p className="text-[#92c0c9] text-sm mb-4">{error || 'Student not found'}</p>
            <Link
              href={groupId ? `/teacher/groups/${groupId}` : '/teacher/dashboard'}
              className="text-[#13c8ec] hover:underline"
            >
              Go back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { student, group, stats, todayIndex, weeklyAggregate, habitsNeedingAttention, habitsOnTrack, privateHabits } = data;

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
      {/* Back Link */}
      <Link
        href={`/teacher/groups/${group.id}`}
        className="inline-flex items-center gap-2 text-[#92c0c9] hover:text-white transition-colors text-sm mb-6"
      >
        <span className="material-symbols-outlined !text-lg">arrow_back</span>
        Back to {group.name}
      </Link>

      {/* Identity Header */}
      <div className="bg-[#192f33] rounded-xl p-6 mb-8">
        <div className="flex flex-col items-center text-center gap-4">
          <h1 className="text-xl text-[#92c0c9]">{student.name}&apos;s Journey</h1>

          <div className="relative">
            <div className="text-6xl md:text-7xl font-black gradient-text">
              {stats.totalCompletionsAllTime}
            </div>
            <div className="text-[#92c0c9] text-sm mt-1">completions</div>
          </div>

          <p className="text-white font-medium">
            {getIdentityMessage(stats.totalCompletionsAllTime)}
          </p>

          {/* Weekly overview */}
          <div className="flex flex-col items-center gap-2 mt-2">
            <span className="text-[#92c0c9] text-sm">This week</span>
            <StudentWeeklyDots completions={weeklyAggregate} todayIndex={todayIndex} />
            <span className="text-[#92c0c9] text-xs">
              {stats.totalCompletionsThisWeek} completion{stats.totalCompletionsThisWeek !== 1 ? 's' : ''} so far
            </span>
          </div>
        </div>
      </div>

      {/* Habits Needing Attention */}
      {habitsNeedingAttention.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400">warning</span>
            Needs Attention ({habitsNeedingAttention.length})
          </h2>
          <div className="flex flex-col gap-3">
            {habitsNeedingAttention.map((habit) => {
              const config = getCategoryConfig(habit.category);
              return (
                <div
                  key={habit.id}
                  className="bg-[#192f33] rounded-xl p-4 border-l-4 border-amber-500/50"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${config.bgColor}`}>
                      <span className={`material-symbols-outlined ${config.color}`}>
                        {config.icon}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium">{habit.name}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <MiniWeekDots
                          completions={habit.weeklyCompletions}
                          todayIndex={todayIndex}
                        />
                        <span className="text-amber-400 text-xs">Streak broken</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Habits On Track */}
      {habitsOnTrack.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#13c8ec]">check_circle</span>
            On Track ({habitsOnTrack.length})
          </h2>
          <div className="flex flex-col gap-3">
            {habitsOnTrack.map((habit) => {
              const config = getCategoryConfig(habit.category);
              return (
                <div
                  key={habit.id}
                  className="bg-[#192f33] rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${config.bgColor}`}>
                      <span className={`material-symbols-outlined ${config.color}`}>
                        {config.icon}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-white font-medium">{habit.name}</p>
                        {habit.currentStreak > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined !text-sm text-[#F5A623]">
                              local_fire_department
                            </span>
                            <span className="text-[#F5A623] text-sm font-medium">
                              {habit.currentStreak}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <MiniWeekDots
                          completions={habit.weeklyCompletions}
                          todayIndex={todayIndex}
                        />
                        <span className="text-[#92c0c9] text-xs">
                          {habit.completionsThisWeek} this week
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

      {/* Private Habits Section */}
      {privateHabits.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#92c0c9]">lock</span>
            Private Habits ({privateHabits.length})
          </h2>
          <SectionCard>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#92c0c9]">shield</span>
              <div>
                <p className="text-white">
                  {privateHabits.length} habit{privateHabits.length !== 1 ? 's' : ''} marked &quot;Teacher Only&quot;
                </p>
                <p className="text-[#92c0c9] text-sm">
                  {privateHabits.filter(h => !h.needsAttention).length} on track •{' '}
                  {privateHabits.filter(h => h.needsAttention).length} need{privateHabits.filter(h => h.needsAttention).length === 1 ? 's' : ''} attention
                </p>
              </div>
            </div>
          </SectionCard>
        </section>
      )}

      {/* No Habits State */}
      {habitsNeedingAttention.length === 0 && habitsOnTrack.length === 0 && privateHabits.length === 0 && (
        <div className="bg-[#192f33] rounded-xl p-8 text-center mb-8">
          <span className="material-symbols-outlined text-4xl text-[#92c0c9] mb-3">add_task</span>
          <p className="text-white font-medium">{student.name} hasn&apos;t created any habits yet.</p>
        </div>
      )}

      {/* Teacher Notes Section */}
      <section className="border-t border-white/10 pt-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#92c0c9]">edit_note</span>
          Teacher Notes
          <span className="text-xs text-[#92c0c9] font-normal">(Private)</span>
        </h2>
        <div className="bg-[#192f33] rounded-xl p-4">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add private notes about this student (e.g., conversations, observations, follow-up reminders)..."
            className="w-full h-32 bg-[#101f22] border border-[#325e67] rounded-lg p-3 text-white placeholder-[#92c0c9]/50 resize-none focus:outline-none focus:border-[#13c8ec]"
          />
          <div className="flex items-center justify-between mt-3">
            <p className="text-[#92c0c9] text-xs">
              Only you can see these notes.
            </p>
            <div className="flex items-center gap-2">
              {noteSaved && (
                <span className="text-green-400 text-sm flex items-center gap-1">
                  <span className="material-symbols-outlined !text-sm">check_circle</span>
                  Saved
                </span>
              )}
              <button
                onClick={saveNote}
                disabled={isSavingNote}
                className="px-4 py-2 bg-[#13c8ec] text-[#101f22] font-medium rounded-lg hover:bg-[#0ea5c7] transition-colors disabled:opacity-50 text-sm"
              >
                {isSavingNote ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
