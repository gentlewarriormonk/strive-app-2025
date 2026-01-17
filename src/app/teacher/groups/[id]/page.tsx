'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { SectionCard } from '@/components/ui/SectionCard';

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
  stats: {
    totalStudents: number;
    avgCompletion: number;
  };
}

// QR Code display component
function JoinCodeDisplay({ code, groupName }: { code: string; groupName: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [code]);

  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="text-xl font-bold text-white mb-2">Invite Your Students</h2>
      <p className="text-[#92c0c9] text-sm mb-6 max-w-md">
        Share this code so others can join {groupName}.
        They can enter it in the Strive app under &quot;Join a Group&quot;.
      </p>

      {/* QR Code placeholder */}
      <div className="w-40 h-40 bg-white p-3 rounded-lg mb-4">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="0" y="0" width="30" height="30" fill="black"/>
          <rect x="70" y="0" width="30" height="30" fill="black"/>
          <rect x="0" y="70" width="30" height="30" fill="black"/>
          <rect x="5" y="5" width="20" height="20" fill="white"/>
          <rect x="75" y="5" width="20" height="20" fill="white"/>
          <rect x="5" y="75" width="20" height="20" fill="white"/>
          <rect x="10" y="10" width="10" height="10" fill="black"/>
          <rect x="80" y="10" width="10" height="10" fill="black"/>
          <rect x="10" y="80" width="10" height="10" fill="black"/>
          <rect x="35" y="5" width="5" height="5" fill="black"/>
          <rect x="45" y="5" width="5" height="5" fill="black"/>
          <rect x="55" y="5" width="5" height="5" fill="black"/>
          <rect x="35" y="15" width="5" height="5" fill="black"/>
          <rect x="50" y="15" width="5" height="5" fill="black"/>
          <rect x="5" y="35" width="5" height="5" fill="black"/>
          <rect x="15" y="40" width="5" height="5" fill="black"/>
          <rect x="25" y="35" width="5" height="5" fill="black"/>
          <rect x="35" y="35" width="30" height="30" fill="black"/>
          <rect x="40" y="40" width="20" height="20" fill="white"/>
          <rect x="45" y="45" width="10" height="10" fill="black"/>
          <rect x="70" y="35" width="5" height="5" fill="black"/>
          <rect x="80" y="40" width="5" height="5" fill="black"/>
          <rect x="90" y="35" width="5" height="5" fill="black"/>
          <rect x="5" y="55" width="5" height="5" fill="black"/>
          <rect x="20" y="55" width="5" height="5" fill="black"/>
          <rect x="35" y="70" width="5" height="5" fill="black"/>
          <rect x="45" y="75" width="5" height="5" fill="black"/>
          <rect x="55" y="70" width="5" height="5" fill="black"/>
          <rect x="70" y="70" width="25" height="25" fill="black"/>
          <rect x="75" y="75" width="15" height="15" fill="white"/>
          <rect x="80" y="80" width="5" height="5" fill="black"/>
        </svg>
      </div>

      {/* Join Code */}
      <div className="bg-[#101f22] rounded-lg px-6 py-3 mb-4">
        <p className="text-3xl font-mono font-bold text-[#13c8ec] tracking-wider">
          {code}
        </p>
      </div>

      <Button
        variant="secondary"
        icon={copied ? 'check' : 'content_copy'}
        onClick={copyToClipboard}
      >
        {copied ? 'Copied!' : 'Copy Code'}
      </Button>

      <p className="text-[#92c0c9] text-xs mt-4">
        Students can scan the QR code or enter the code manually
      </p>
    </div>
  );
}

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  // Group rename state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleEditName = () => {
    if (dashboardData?.group) {
      setEditedName(dashboardData.group.name);
      setIsEditingName(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName('');
  };

  const handleSaveName = async () => {
    if (!editedName.trim() || !dashboardData?.group) return;

    setIsSavingName(true);
    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editedName.trim() }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to rename group');
      }

      const updatedGroup = await response.json();
      setDashboardData(prev => prev ? {
        ...prev,
        group: { ...prev.group, name: updatedGroup.name },
      } : null);
      setIsEditingName(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to rename group');
    } finally {
      setIsSavingName(false);
    }
  };

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await fetch(`/api/teacher/dashboard?groupId=${groupId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Group not found');
          } else {
            setError('Failed to load group');
          }
          return;
        }
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        console.error('Failed to fetch dashboard:', err);
        setError('Failed to load group');
      } finally {
        setIsLoading(false);
      }
    }

    if (groupId) {
      fetchDashboard();
    }
  }, [groupId]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#13c8ec] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-[#92c0c9]">Loading group...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <span className="material-symbols-outlined text-4xl text-red-400 mb-4">error</span>
            <p className="text-white font-medium mb-2">Something went wrong</p>
            <p className="text-[#92c0c9] text-sm">{error || 'Group not found'}</p>
            <Link href="/teacher/dashboard" className="text-[#13c8ec] hover:underline mt-4 inline-block">
              Back to My Groups
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { group, studentSummaries, stats } = dashboardData;
  const hasStudents = studentSummaries.length > 0;

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Link
              href="/teacher/dashboard"
              className="w-8 h-8 flex items-center justify-center rounded-full text-[#92c0c9] hover:bg-white/10 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="text-2xl md:text-3xl font-black text-white tracking-tight bg-[#192f33] border border-[#325e67] rounded-lg px-3 py-1 focus:outline-none focus:border-[#13c8ec]"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                />
                <button
                  onClick={handleSaveName}
                  disabled={isSavingName || !editedName.trim()}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined !text-lg">
                    {isSavingName ? 'hourglass_empty' : 'check'}
                  </span>
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSavingName}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined !text-lg">close</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                  {group.name}
                </h1>
                <button
                  onClick={handleEditName}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-[#92c0c9] hover:bg-white/10 hover:text-white transition-colors"
                  title="Rename group"
                >
                  <span className="material-symbols-outlined !text-lg">edit</span>
                </button>
                {saveSuccess && (
                  <span className="text-green-400 text-sm flex items-center gap-1">
                    <span className="material-symbols-outlined !text-sm">check_circle</span>
                    Saved
                  </span>
                )}
              </div>
            )}
          </div>
          {hasStudents && (
            <p className="text-[#92c0c9] text-base ml-11">
              {stats.totalStudents} member{stats.totalStudents !== 1 ? 's' : ''} • {stats.avgCompletion}% avg completion
            </p>
          )}
          {group.description && (
            <p className="text-[#92c0c9] text-sm ml-11">{group.description}</p>
          )}
        </div>
      </div>

      {/* Empty State - Prominent Join Code */}
      {!hasStudents && (
        <SectionCard className="mb-8" padding="lg">
          <JoinCodeDisplay code={group.joinCode} groupName={group.name} />
        </SectionCard>
      )}

      {/* With Students - Show compact invite + stats + table */}
      {hasStudents && (
        <>
          {/* Stats and Invite Row */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
            {/* Quick Stats */}
            <SectionCard padding="md">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#13c8ec]/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#13c8ec]">group</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalStudents}</p>
                  <p className="text-[#92c0c9] text-sm">Members</p>
                </div>
              </div>
            </SectionCard>

            <SectionCard padding="md">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-400">trending_up</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.avgCompletion}%</p>
                  <p className="text-[#92c0c9] text-sm">Avg Completion</p>
                </div>
              </div>
            </SectionCard>

            {/* Compact Invite */}
            <SectionCard padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#92c0c9] text-xs mb-1">Join Code</p>
                  <p className="text-xl font-mono font-bold text-[#13c8ec]">{group.joinCode}</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  icon="content_copy"
                  onClick={() => navigator.clipboard.writeText(group.joinCode)}
                >
                  Copy
                </Button>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#325e67]">
                  {studentSummaries.map((summary) => {
                    const { student, activeHabits, recentCompletion, bestStreak } = summary;

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
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
