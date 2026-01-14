'use client';

import { useState, useMemo, useCallback, use } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/Button';
import { ChallengeForm, ChallengeFormData } from '@/components/challenges/ChallengeForm';
import { Leaderboard } from '@/components/Leaderboard';
import { InviteCodeCard } from '@/components/InviteCodeCard';
import {
  getGroupById,
  getGroupStudents,
  getStudentSummary,
  getGroupChallenges,
  getChallengeParticipants,
  currentTeacher,
} from '@/lib/mockData';
import { Challenge, ChallengeParticipation } from '@/types/models';

interface GroupDashboardPageProps {
  params: Promise<{ groupId: string }>;
}

// Interactive Challenge Card with join functionality
function InteractiveChallengeCard({ 
  challenge, 
  isJoined,
  participantCount,
  onToggleJoin 
}: { 
  challenge: Challenge;
  isJoined: boolean;
  participantCount: number;
  onToggleJoin: () => void;
}) {
  const progressPercent = isJoined ? Math.random() * 60 + 20 : 0; // Mock progress

  return (
    <div className="bg-[#192f33] rounded-xl p-5 border border-[#325e67]/50 card-hover">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h4 className="text-lg font-bold text-white">{challenge.name}</h4>
          {challenge.description && (
            <p className="text-sm text-[#92c0c9] mt-1">{challenge.description}</p>
          )}
        </div>
        {isJoined && (
          <span className="flex items-center gap-1 text-green-400 text-xs font-medium bg-green-400/10 px-2 py-1 rounded-full">
            <span className="material-symbols-outlined !text-sm">check</span>
            Joined
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-[#92c0c9] mb-4">
        {challenge.targetCategory && (
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined !text-base">category</span>
            {challenge.targetCategory}
          </span>
        )}
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined !text-base">calendar_today</span>
          {new Date(challenge.endDate).toLocaleDateString()}
        </span>
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined !text-base text-[#F5A623]">stars</span>
          {challenge.rewardXp} XP
        </span>
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined !text-base">group</span>
          {participantCount} joined
        </span>
      </div>

      {isJoined && (
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#92c0c9]">Your Progress</span>
            <span className="font-medium text-white">
              {Math.round(progressPercent * challenge.targetValue / 100)} / {challenge.targetValue}
            </span>
          </div>
          <div className="w-full bg-[#325e67] rounded-full h-3">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-[#13c8ec] to-[#3b82f6] transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      <Button 
        variant={isJoined ? "ghost" : "secondary"} 
        fullWidth 
        size="sm"
        onClick={onToggleJoin}
        icon={isJoined ? "remove" : "add"}
      >
        {isJoined ? "Leave Challenge" : "Join Challenge"}
      </Button>
    </div>
  );
}

export default function GroupDashboardPage({ params }: GroupDashboardPageProps) {
  const { groupId } = use(params);
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  
  // Local state for challenges
  const [localChallenges, setLocalChallenges] = useState<Challenge[]>(() => 
    getGroupChallenges(groupId)
  );
  
  // Local state for joined challenges (by current user)
  const [joinedChallenges, setJoinedChallenges] = useState<Set<string>>(() => {
    // Initialize with some mock joined challenges
    const joined = new Set<string>();
    localChallenges.slice(0, 1).forEach(c => joined.add(c.id));
    return joined;
  });

  const group = getGroupById(groupId);
  if (!group) {
    notFound();
  }

  const students = getGroupStudents(groupId);
  const activeChallenges = useMemo(() => 
    localChallenges.filter((c) => c.isActive),
    [localChallenges]
  );
  const pastChallenges = useMemo(() => 
    localChallenges.filter((c) => !c.isActive),
    [localChallenges]
  );

  // Get student summaries for leaderboard
  const studentSummaries = students
    .map((s) => getStudentSummary(s.id))
    .filter(Boolean)
    .map((s) => s!);

  // XP Leaderboard
  const xpLeaderboard = studentSummaries
    .sort((a, b) => b.student.xp - a.student.xp)
    .slice(0, 5)
    .map((s) => ({
      user: s.student,
      value: s.student.xp,
      label: 'XP',
    }));

  // Streak Leaderboard
  const streakLeaderboard = studentSummaries
    .sort((a, b) => b.bestStreak - a.bestStreak)
    .slice(0, 5)
    .map((s) => ({
      user: s.student,
      value: s.bestStreak,
      label: 'days',
    }));

  // Group stats
  const avgCompletion = studentSummaries.length > 0
    ? Math.round(
        studentSummaries.reduce((sum, s) => sum + s.recentCompletion, 0) /
          studentSummaries.length
      )
    : 0;

  const totalHabits = studentSummaries.reduce((sum, s) => sum + s.activeHabits, 0);

  // Handle challenge creation
  const handleCreateChallenge = useCallback((data: ChallengeFormData) => {
    const newChallenge: Challenge = {
      id: `challenge-new-${Date.now()}`,
      name: data.name,
      description: data.description,
      groupId: groupId,
      createdByUserId: currentTeacher.id,
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
  }, [groupId]);

  // Handle join/leave challenge
  const toggleJoinChallenge = useCallback((challengeId: string) => {
    setJoinedChallenges(prev => {
      const newSet = new Set(prev);
      if (newSet.has(challengeId)) {
        newSet.delete(challengeId);
      } else {
        newSet.add(challengeId);
      }
      return newSet;
    });
  }, []);

  // Get participant count (mock + joined state)
  const getParticipantCount = useCallback((challengeId: string) => {
    const mockParticipants = getChallengeParticipants(challengeId).length;
    const isJoined = joinedChallenges.has(challengeId);
    // If joined and not in mock, add 1
    return mockParticipants + (isJoined ? 1 : 0);
  }, [joinedChallenges]);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            {group.name}
          </h1>
          {group.description && (
            <p className="text-[#92c0c9] text-base">{group.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button icon="add" onClick={() => setShowChallengeForm(true)}>
            Create Challenge
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <SectionCard padding="md">
          <div className="text-center">
            <p className="text-3xl font-bold text-white">{students.length}</p>
            <p className="text-[#92c0c9] text-sm mt-1">Students</p>
          </div>
        </SectionCard>
        <SectionCard padding="md">
          <div className="text-center">
            <p className="text-3xl font-bold text-white">{totalHabits}</p>
            <p className="text-[#92c0c9] text-sm mt-1">Active Habits</p>
          </div>
        </SectionCard>
        <SectionCard padding="md">
          <div className="text-center">
            <p className="text-3xl font-bold gradient-text">{avgCompletion}%</p>
            <p className="text-[#92c0c9] text-sm mt-1">Avg. Completion</p>
          </div>
        </SectionCard>
        <SectionCard padding="md">
          <div className="text-center">
            <p className="text-3xl font-bold text-white">{activeChallenges.length}</p>
            <p className="text-[#92c0c9] text-sm mt-1">Active Challenges</p>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Challenges */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Active Challenges</h2>
              <Button
                variant="ghost"
                size="sm"
                icon="add"
                onClick={() => setShowChallengeForm(true)}
              >
                New
              </Button>
            </div>
            {activeChallenges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeChallenges.map((challenge) => (
                  <InteractiveChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    isJoined={joinedChallenges.has(challenge.id)}
                    participantCount={getParticipantCount(challenge.id)}
                    onToggleJoin={() => toggleJoinChallenge(challenge.id)}
                  />
                ))}
              </div>
            ) : (
              <SectionCard>
                <div className="text-center py-6">
                  <span className="material-symbols-outlined text-4xl text-[#92c0c9] mb-3">
                    emoji_events
                  </span>
                  <p className="text-white font-medium mb-2">No active challenges</p>
                  <p className="text-[#92c0c9] text-sm mb-4">
                    Create a challenge to motivate your students!
                  </p>
                  <Button onClick={() => setShowChallengeForm(true)} icon="add">
                    Create Challenge
                  </Button>
                </div>
              </SectionCard>
            )}
          </section>

          {/* Students Table */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Students</h2>
              <Link
                href="/teacher/dashboard"
                className="text-sm text-[#13c8ec] hover:underline"
              >
                View all →
              </Link>
            </div>
            <div className="overflow-hidden rounded-lg border border-[#325e67] bg-[#111f22]">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-[#192f33]">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-white">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-white">
                        Habits
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-white">
                        Completion
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-white">
                        Streak
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#325e67]">
                    {studentSummaries.slice(0, 5).map((summary) => (
                      <tr
                        key={summary.student.id}
                        className="hover:bg-[#192f33] transition-colors"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/teacher/students/${summary.student.id}`}
                            className="flex items-center gap-3"
                          >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#13c8ec] to-[#3b82f6] flex items-center justify-center text-white text-sm font-bold">
                              {summary.student.name.charAt(0)}
                            </div>
                            <span className="text-white text-sm">{summary.student.name}</span>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#92c0c9]">
                          {summary.activeHabits}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={
                              summary.recentCompletion >= 80
                                ? 'text-green-400'
                                : summary.recentCompletion >= 60
                                ? 'text-yellow-400'
                                : 'text-red-400'
                            }
                          >
                            {summary.recentCompletion}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#92c0c9]">
                          {summary.bestStreak > 0 ? (
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined !text-sm text-[#F5A623]">
                                local_fire_department
                              </span>
                              {summary.bestStreak}d
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Past Challenges */}
          {pastChallenges.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-white mb-4">Past Challenges</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pastChallenges.map((challenge) => (
                  <div key={challenge.id} className="opacity-60">
                    <SectionCard padding="md">
                      <h3 className="text-white font-bold mb-1">{challenge.name}</h3>
                      <p className="text-[#92c0c9] text-sm">Ended {new Date(challenge.endDate).toLocaleDateString()}</p>
                    </SectionCard>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar - Leaderboards */}
        <aside className="space-y-6">
          <Leaderboard
            title="Top XP This Month"
            entries={xpLeaderboard}
            valueIcon="stars"
          />
          <Leaderboard
            title="Best Streaks"
            entries={streakLeaderboard}
            valueIcon="local_fire_department"
          />

          {/* Join Code */}
          <SectionCard title="Join Code">
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-[#101f22] px-4 py-2 rounded-lg text-white font-mono text-lg truncate">
                {group.joinCode}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(group.joinCode)}
                className="p-2 rounded-lg bg-[#234248] text-[#92c0c9] hover:text-white transition-colors flex-shrink-0"
                aria-label="Copy code"
              >
                <span className="material-symbols-outlined">content_copy</span>
              </button>
            </div>
          </SectionCard>
        </aside>
      </div>

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
