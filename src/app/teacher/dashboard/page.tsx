'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/Button';

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

// QR Code display component (simplified inline version)
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
        Share this code with your students so they can join {groupName}.
        They can enter it in the Strive app under &quot;Join a Class&quot;.
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

export default function TeacherDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

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
  const stats = dashboardData?.stats || { totalStudents: 0, avgCompletion: 0 };
  const hasStudents = studentSummaries.length > 0;

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
          {hasStudents && (
            <p className="text-[#92c0c9] text-base">
              {stats.totalStudents} student{stats.totalStudents !== 1 ? 's' : ''} • {stats.avgCompletion}% avg completion
            </p>
          )}
        </div>
      </div>

      {/* Empty State - Prominent Join Code */}
      {!hasStudents && selectedGroup && (
        <SectionCard className="mb-8" padding="lg">
          <JoinCodeDisplay code={selectedGroup.joinCode} groupName={selectedGroup.name} />
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
                  <p className="text-[#92c0c9] text-sm">Students</p>
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
                  <p className="text-xl font-mono font-bold text-[#13c8ec]">{selectedGroup?.joinCode}</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  icon="content_copy"
                  onClick={() => {
                    if (selectedGroup) {
                      navigator.clipboard.writeText(selectedGroup.joinCode);
                    }
                  }}
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
