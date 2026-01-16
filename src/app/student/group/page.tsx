'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageShell } from '@/components/layout/PageShell';
import { SectionCard } from '@/components/ui/SectionCard';

interface GroupMember {
  user: {
    id: string;
    name: string;
    image: string | null;
    role: string;
    xp: number;
    level: number;
  };
  publicHabitCount: number;
  bestStreak: number;
  completedToday: number;
  totalHabits: number;
  isCurrentUser: boolean;
}

interface GroupData {
  id: string;
  name: string;
  description: string | null;
  teacher: {
    id: string;
    name: string;
    image: string | null;
    xp: number;
    level: number;
  };
}

interface ClassStats {
  totalStudents: number;
  studentsCompletedToday: number;
  avgCompletionToday: number;
}

export default function StudentGroupPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [classStats, setClassStats] = useState<ClassStats | null>(null);

  // Fetch group data
  useEffect(() => {
    async function fetchGroupData() {
      setIsLoading(true);
      try {
        const url = selectedGroupId
          ? `/api/student/group?groupId=${selectedGroupId}`
          : '/api/student/group';
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setGroups(data.groups || []);
          setSelectedGroup(data.selectedGroup);
          setMembers(data.members || []);
          setClassStats(data.classStats);
          if (data.selectedGroup && !selectedGroupId) {
            setSelectedGroupId(data.selectedGroup.id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch group data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchGroupData();
  }, [selectedGroupId]);

  // Loading state
  if (isLoading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#13c8ec] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-[#92c0c9]">Loading your class...</p>
          </div>
        </div>
      </PageShell>
    );
  }

  // No groups state
  if (groups.length === 0) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <span className="material-symbols-outlined text-5xl text-[#92c0c9] mb-4">group_off</span>
            <h2 className="text-2xl font-bold text-white mb-2">No Classes Yet</h2>
            <p className="text-[#92c0c9] mb-6">
              You haven&apos;t joined any classes yet. Ask your teacher for a join code.
            </p>
            <Link
              href="/student/today"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#13c8ec] text-white rounded-lg hover:bg-[#13c8ec]/80 transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Back to Today
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-wrap justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                {selectedGroup?.name || 'My Class'}
              </h1>
              {groups.length > 1 && (
                <select
                  value={selectedGroupId || ''}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="bg-[#192f33] border border-[#325e67] rounded-lg px-3 py-1 text-white text-sm"
                >
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              )}
            </div>
            {selectedGroup?.description && (
              <p className="text-[#92c0c9] text-base">{selectedGroup.description}</p>
            )}
            <p className="text-slate-500 text-sm max-w-2xl">
              You can see only the habits your classmates choose to share publicly.
              Private and anonymised habits are not shown.
            </p>
          </div>
        </div>

        {/* Class Stats */}
        {classStats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SectionCard padding="md">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{classStats.totalStudents}</p>
                <p className="text-[#92c0c9] text-sm">Students</p>
              </div>
            </SectionCard>
            <SectionCard padding="md">
              <div className="text-center">
                <p className="text-3xl font-bold text-[#13c8ec]">{classStats.studentsCompletedToday}</p>
                <p className="text-[#92c0c9] text-sm">Active Today</p>
              </div>
            </SectionCard>
            <SectionCard padding="md">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-400">{classStats.avgCompletionToday}%</p>
                <p className="text-[#92c0c9] text-sm">Class Completion</p>
              </div>
            </SectionCard>
          </div>
        )}

        {/* Teacher Card */}
        {selectedGroup?.teacher && (
          <section>
            <h2 className="text-lg font-bold text-white mb-3">Teacher</h2>
            <Link
              href={`/student/profile/${selectedGroup.teacher.id}`}
              className="flex items-center gap-4 p-4 bg-[#192f33] rounded-xl border border-[#13c8ec]/40 hover:border-[#13c8ec] transition-all hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#13c8ec] to-[#3b82f6] flex items-center justify-center text-white text-xl font-bold">
                {selectedGroup.teacher.name?.charAt(0) || '?'}
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-lg">{selectedGroup.teacher.name}</p>
                <p className="text-[#92c0c9] text-sm">Teacher</p>
              </div>
              <div className="text-right">
                <p className="text-[#13c8ec] font-semibold">Level {selectedGroup.teacher.level}</p>
                <p className="text-[#92c0c9] text-xs">{selectedGroup.teacher.xp} XP</p>
              </div>
            </Link>
          </section>
        )}

        {/* Classmates */}
        <section>
          <h2 className="text-lg font-bold text-white mb-3">Classmates</h2>
          {members.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {members.map((member) => (
                <Link
                  key={member.user.id}
                  href={`/student/profile/${member.user.id}`}
                  className={`flex flex-col gap-4 p-4 bg-[#192f33] rounded-xl border transition-all hover:-translate-y-1 ${
                    member.isCurrentUser
                      ? 'border-[#13c8ec]/60 hover:border-[#13c8ec]'
                      : 'border-white/10 hover:border-[#13c8ec]/50'
                  }`}
                >
                  {/* User Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#13c8ec] to-[#3b82f6] flex items-center justify-center text-white font-bold">
                      {member.user.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold truncate">
                        {member.user.name}
                        {member.isCurrentUser && (
                          <span className="text-[#13c8ec] text-xs ml-2">(You)</span>
                        )}
                      </p>
                      <p className="text-[#92c0c9] text-xs">Level {member.user.level}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex justify-between text-sm">
                    <div className="text-center">
                      <p className="text-white font-semibold">{member.publicHabitCount}</p>
                      <p className="text-[#92c0c9] text-xs">Public Habits</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-semibold flex items-center justify-center gap-1">
                        {member.bestStreak > 0 && (
                          <span className="material-symbols-outlined !text-sm text-[#F5A623]">
                            local_fire_department
                          </span>
                        )}
                        {member.bestStreak}
                      </p>
                      <p className="text-[#92c0c9] text-xs">Best Streak</p>
                    </div>
                    <div className="text-center">
                      <p className={`font-semibold ${member.completedToday > 0 ? 'text-green-400' : 'text-[#92c0c9]'}`}>
                        {member.completedToday}/{member.totalHabits}
                      </p>
                      <p className="text-[#92c0c9] text-xs">Today</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-[#192f33] rounded-xl p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-[#92c0c9] mb-3">group</span>
              <p className="text-white font-medium mb-2">No Classmates Yet</p>
              <p className="text-[#92c0c9] text-sm">
                You&apos;re the first one here! More students will appear as they join.
              </p>
            </div>
          )}
        </section>

        {/* Privacy Notice */}
        <div className="bg-[#192f33]/50 rounded-lg p-4 border border-[#325e67]/50">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[#92c0c9]">visibility</span>
            <div>
              <p className="text-white font-medium text-sm">Privacy Settings</p>
              <p className="text-[#92c0c9] text-xs mt-1">
                Only habits marked as &quot;Public to Class&quot; are shown here.
                Your private and anonymised habits are never visible to classmates.
                You can change visibility settings when creating or editing habits.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
