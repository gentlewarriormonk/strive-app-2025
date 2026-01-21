'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PageShell } from '@/components/layout/PageShell';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/Button';
import { GroupForm } from '@/components/groups/GroupForm';

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

  // Join group form state
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);

  // Create group form state
  const [showCreateForm, setShowCreateForm] = useState(false);

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

  // Handle join group
  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);
    setJoinSuccess(null);
    setIsJoining(true);

    try {
      const response = await fetch('/api/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ joinCode: joinCode.trim().toUpperCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join group');
      }

      setJoinSuccess(`Successfully joined ${data.group.name}!`);
      setJoinCode('');

      // Refresh the page data after a short delay
      setTimeout(() => {
        setSelectedGroupId(data.group.id);
        setJoinSuccess(null);
      }, 1500);
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Failed to join group');
    } finally {
      setIsJoining(false);
    }
  };

  // Handle create group
  const handleCreateGroup = useCallback(async (data: { name: string; description: string }) => {
    const response = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create group');
    }

    const newGroup = await response.json();
    // Refresh to show the new group
    setSelectedGroupId(newGroup.id);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#13c8ec] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-[#92c0c9]">Loading your group...</p>
          </div>
        </div>
      </PageShell>
    );
  }

  // No groups state - show join form
  if (groups.length === 0) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md w-full">
            <span className="material-symbols-outlined text-5xl text-[#92c0c9] mb-4">group_add</span>
            <h2 className="text-2xl font-bold text-white mb-2">Join a Group</h2>
            <p className="text-[#92c0c9] mb-6">
              Enter the join code to connect with your group.
            </p>

            {/* Join Form */}
            <form onSubmit={handleJoinGroup} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => {
                    setJoinCode(e.target.value.toUpperCase());
                    setJoinError(null);
                  }}
                  className="input-field w-full text-center text-2xl font-mono tracking-widest uppercase"
                  placeholder="ABCD1234"
                  maxLength={8}
                  required
                />
                <p className="text-[#92c0c9] text-xs mt-2">
                  The code is 8 characters, like &quot;ABCD1234&quot;
                </p>
              </div>

              {/* Error Message */}
              {joinError && (
                <div className="flex items-center justify-center gap-2 text-red-400 text-sm">
                  <span className="material-symbols-outlined !text-lg">error</span>
                  {joinError}
                </div>
              )}

              {/* Success Message */}
              {joinSuccess && (
                <div className="flex items-center justify-center gap-2 text-green-400 text-sm">
                  <span className="material-symbols-outlined !text-lg">check_circle</span>
                  {joinSuccess}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isJoining || joinCode.length < 8}
              >
                {isJoining ? 'Joining...' : 'Join Group'}
              </Button>
            </form>

            {/* Divider with "or" */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-[#325e67]" />
              <span className="text-[#92c0c9] text-sm">or</span>
              <div className="flex-1 h-px bg-[#325e67]" />
            </div>

            {/* Create Group Option */}
            <div className="text-center">
              <p className="text-[#92c0c9] text-sm mb-3">
                Start a peer accountability group with friends
              </p>
              <Button
                variant="secondary"
                onClick={() => setShowCreateForm(true)}
              >
                <span className="material-symbols-outlined !text-lg mr-2">add</span>
                Create a Group
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-[#325e67]">
              <Link
                href="/student/today"
                className="inline-flex items-center gap-2 text-[#92c0c9] hover:text-white transition-colors text-sm"
              >
                <span className="material-symbols-outlined !text-lg">arrow_back</span>
                Back to My Habits
              </Link>
            </div>
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
                {selectedGroup?.name || 'My Group'}
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
              You can see only habits marked as &quot;Visible to Group&quot;.
              Private habits are not shown here.
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
                <p className="text-[#92c0c9] text-sm">Group Completion</p>
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

        {/* Group Members */}
        <section>
          <h2 className="text-lg font-bold text-white mb-3">Group Members</h2>
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
              <p className="text-white font-medium mb-2">No Group Members Yet</p>
              <p className="text-[#92c0c9] text-sm">
                You&apos;re the first one here! More members will appear as they join.
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
                Only habits marked as &quot;Visible to Group&quot; are shown here.
                Private habits are never visible to group members.
                You can change visibility settings when creating or editing habits.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateForm && (
        <GroupForm
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateGroup}
        />
      )}
    </PageShell>
  );
}
