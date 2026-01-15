'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/Button';
import { ChallengeForm, ChallengeFormData } from '@/components/challenges/ChallengeForm';
import { InviteCodeCard } from '@/components/InviteCodeCard';
import { Challenge } from '@/types/models';

interface StudentSummary {
  student: {
    id: string;
    name: string;
    email: string | null;
    image: string | null;
    xp: number;
    level: number;
  };
  activeHabits: number;
  recentCompletion: number;
  bestStreak: number;
  challengesJoined: number;
}

interface GroupData {
  id: string;
  name: string;
  description: string | null;
  joinCode: string;
}

interface DashboardData {
  group: GroupData;
  studentSummaries: StudentSummary[];
  challenges: Challenge[];
  stats: {
    totalStudents: number;
    activeChallenges: number;
    avgCompletion: number;
  };
}

export default function TeacherDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [showChallengeForm, setShowChallengeForm] = useState(false);

  // Fetch teacher's groups on mount
  useEffect(() => {
    async function fetchGroups() {
      try {
        const response = await fetch('/api/groups');
        if (response.ok) {
          const data = await response.json();
          setGroups(data);
          if (data.length > 0) {
            setSelectedGroupId(data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch groups:', err);
        setError('Failed to load classes');
      }
    }
    fetchGroups();
  }, []);

  // Fetch dashboard data when selected group changes
  useEffect(() => {
    async function fetchDashboard() {
      if (!selectedGroupId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/teacher/dashboard?groupId=${selectedGroupId}`);
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        } else {
          setError('Failed to load dashboard data');
        }
      } catch (err) {
        console.error('Failed to fetch dashboard:', err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboard();
  }, [selectedGroupId]);

  // Handle new challenge creation
  const handleCreateChallenge = useCallback(async (data: ChallengeFormData) => {
    if (!selectedGroupId) return;

    const response = await fetch('/api/challenges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        groupId: selectedGroupId,
      }),
    });

    if (response.ok) {
      const newChallenge = await response.json();
      setDashboardData(prev => prev ? {
        ...prev,
        challenges: [...prev.challenges, newChallenge],
        stats: {
          ...prev.stats,
          activeChallenges: prev.stats.activeChallenges + 1,
        },
      } : null);
    }
  }, [selectedGroupId]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#13c8ec] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-[#92c0c9]">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <span className="material-symbols-outlined text-4xl text-red-400 mb-4">error</span>
            <p className="text-white font-medium mb-2">Something went wrong</p>
            <p className="text-[#92c0c9] text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no groups
  if (groups.length === 0) {
    return (
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <span className="material-symbols-outlined text-5xl text-[#92c0c9] mb-4">school</span>
            <h2 className="text-2xl font-bold text-white mb-2">No Classes Yet</h2>
            <p className="text-[#92c0c9] mb-6">
              Create your first class to start tracking student habits and well-being.
            </p>
            <p className="text-[#92c0c9] text-sm">
              Use the &quot;New Class&quot; button in the sidebar to get started.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const selectedGroup = dashboardData?.group;
  const studentSummaries = dashboardData?.studentSummaries || [];
  const activeChallenges = dashboardData?.challenges || [];
  const stats = dashboardData?.stats || { totalStudents: 0, activeChallenges: 0, avgCompletion: 0 };

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              {selectedGroup?.name || 'Dashboard'}
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
          <p className="text-[#92c0c9] text-base">
            Manage and track your students&apos; well-being and habits.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon="add"
            size="md"
            onClick={() => setShowChallengeForm(true)}
          >
            Create Challenge
          </Button>
        </div>
      </div>

      {/* Invite Students Card */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <SectionCard className="lg:col-span-2" padding="md">
          {selectedGroup && (
            <InviteCodeCard code={selectedGroup.joinCode} groupName={selectedGroup.name} />
          )}
        </SectionCard>

        {/* Quick Stats */}
        <SectionCard padding="md">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[#92c0c9] text-sm">Students</span>
              <span className="text-white font-bold text-xl">{stats.totalStudents}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#92c0c9] text-sm">Active Challenges</span>
              <span className="text-white font-bold text-xl">{stats.activeChallenges}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#92c0c9] text-sm">Avg. Completion</span>
              <span className="text-white font-bold text-xl">{stats.avgCompletion}%</span>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Students Table */}
      {studentSummaries.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-[#325e67] bg-[#111f22]">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[#192f33]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white hidden sm:table-cell">
                    Active habits
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white hidden md:table-cell">
                    Recent completion %
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white hidden lg:table-cell">
                    Best streak
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white hidden xl:table-cell">
                    XP / Level
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white hidden 2xl:table-cell">
                    Challenges joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#325e67]">
                {studentSummaries.map((summary) => {
                  const { student, activeHabits, recentCompletion, bestStreak, challengesJoined } = summary;

                  return (
                    <tr
                      key={student.id}
                      className="cursor-pointer transition-colors hover:bg-[#192f33]"
                    >
                      <td className="h-[72px] px-4 py-2">
                        <Link
                          href={`/teacher/students/${student.id}`}
                          className="flex items-center gap-3"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#13c8ec] to-[#3b82f6] flex items-center justify-center text-white text-sm font-bold">
                            {student.name.charAt(0)}
                          </div>
                          <span className="text-white text-sm font-normal">{student.name}</span>
                        </Link>
                      </td>
                      <td className="h-[72px] px-4 py-2 text-sm text-[#92c0c9] hidden sm:table-cell">
                        {activeHabits}
                      </td>
                      <td className="h-[72px] px-4 py-2 text-sm hidden md:table-cell">
                        <span
                          className={
                            recentCompletion >= 80
                              ? 'text-green-400'
                              : recentCompletion >= 60
                              ? 'text-yellow-400'
                              : 'text-red-400'
                          }
                        >
                          {recentCompletion}%
                        </span>
                      </td>
                      <td className="h-[72px] px-4 py-2 text-sm text-[#92c0c9] hidden lg:table-cell">
                        {bestStreak > 0 ? (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined !text-base text-[#F5A623]">
                              local_fire_department
                            </span>
                            {bestStreak} days
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="h-[72px] px-4 py-2 hidden xl:table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-24 overflow-hidden rounded-full bg-[#325e67]">
                            <div
                              className="h-1.5 rounded-full bg-[#13c8ec]"
                              style={{ width: `${Math.min((student.xp % 500) / 5, 100)}%` }}
                            />
                          </div>
                          <p className="text-sm font-medium text-white">Lv {student.level}</p>
                        </div>
                      </td>
                      <td className="h-[72px] px-4 py-2 text-sm text-[#92c0c9] hidden 2xl:table-cell">
                        {challengesJoined}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-[#325e67] bg-[#111f22] p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-[#92c0c9] mb-3">group_add</span>
          <p className="text-white font-medium mb-2">No Students Yet</p>
          <p className="text-[#92c0c9] text-sm">
            Share the join code above with your students to add them to this class.
          </p>
        </div>
      )}

      {/* Active Challenges Section */}
      {activeChallenges.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold text-white mb-4">Active Challenges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeChallenges.map((challenge) => (
              <SectionCard key={challenge.id} padding="md">
                <h3 className="text-white font-bold mb-2">{challenge.name}</h3>
                {challenge.description && (
                  <p className="text-[#92c0c9] text-sm mb-3">{challenge.description}</p>
                )}
                <div className="flex flex-wrap gap-3 text-xs text-[#92c0c9]">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined !text-sm">calendar_today</span>
                    Ends {new Date(challenge.endDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined !text-sm text-[#F5A623]">stars</span>
                    {challenge.rewardXp} XP
                  </span>
                </div>
              </SectionCard>
            ))}
          </div>
        </section>
      )}

      {/* Challenge Form Modal */}
      {showChallengeForm && (
        <ChallengeForm
          onClose={() => setShowChallengeForm(false)}
          onSubmit={handleCreateChallenge}
        />
      )}
    </div>
  );
}
