'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/Button';
import { ChallengeForm, ChallengeFormData } from '@/components/challenges/ChallengeForm';
import { InviteCodeCard } from '@/components/InviteCodeCard';
import {
  groups,
  getGroupStudents,
  getStudentSummary,
  getActiveChallenges,
  challenges as mockChallenges,
} from '@/lib/mockData';
import { Challenge } from '@/types/models';

export default function TeacherDashboardPage() {
  const [selectedGroupId, setSelectedGroupId] = useState('group-1');
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  
  // Local state for challenges (layered on mock data)
  const [localChallenges, setLocalChallenges] = useState<Challenge[]>(() => 
    mockChallenges.filter(c => c.groupId === 'group-1')
  );

  const selectedGroup = groups.find((g) => g.id === selectedGroupId)!;
  const students = getGroupStudents(selectedGroupId);

  // Get active challenges from local state
  const activeChallenges = useMemo(() => 
    localChallenges.filter(c => c.isActive),
    [localChallenges]
  );

  // Get summaries for all students
  const studentSummaries = students
    .map((s) => getStudentSummary(s.id))
    .filter(Boolean);

  // Handle new challenge creation
  const handleCreateChallenge = useCallback((data: ChallengeFormData) => {
    const newChallenge: Challenge = {
      id: `challenge-new-${Date.now()}`,
      name: data.name,
      description: data.description,
      groupId: selectedGroupId,
      createdByUserId: 'teacher-1',
      targetCategory: data.targetCategory || undefined,
      targetType: data.targetType,
      targetValue: data.targetValue,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      rewardXp: data.rewardXp,
      badgeName: data.badgeName || undefined,
      isActive: true,
      createdAt: new Date(),
    };
    setLocalChallenges(prev => [...prev, newChallenge]);
  }, [selectedGroupId]);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            {selectedGroup.name}
          </h1>
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
          <InviteCodeCard code={selectedGroup.joinCode} groupName={selectedGroup.name} />
        </SectionCard>

        {/* Quick Stats */}
        <SectionCard padding="md">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[#92c0c9] text-sm">Students</span>
              <span className="text-white font-bold text-xl">{students.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#92c0c9] text-sm">Active Challenges</span>
              <span className="text-white font-bold text-xl">{activeChallenges.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#92c0c9] text-sm">Avg. Completion</span>
              <span className="text-white font-bold text-xl">
                {studentSummaries.length > 0
                  ? Math.round(
                      studentSummaries.reduce((sum, s) => sum + (s?.recentCompletion || 0), 0) /
                        studentSummaries.length
                    )
                  : 0}
                %
              </span>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Students Table */}
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
                if (!summary) return null;
                const { student, activeHabits, recentCompletion, bestStreak, challengesJoined } =
                  summary;

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
