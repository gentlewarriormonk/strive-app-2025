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
  lastActive: string | null;
  completionsThisWeek: number;
  completionsLastWeek: number;
  bestStreak: number;
}

interface Celebration {
  type: string;
  studentName: string;
  detail: string;
}

interface StudentNeedingSupport {
  id: string;
  name: string;
  reason: string;
  lastActive: string | null;
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
  celebrations: Celebration[];
  studentsNeedingSupport: StudentNeedingSupport[];
  classPulse: number[];
  todayIndex: number;
  stats: {
    totalStudents: number;
    activeStudentsThisWeek: number;
    totalCompletionsThisWeek: number;
  };
}

// Class Pulse weekly dots component
function ClassPulseDots({ pulse, todayIndex }: { pulse: number[]; todayIndex: number }) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="flex items-center gap-2">
      {days.map((day, i) => {
        const isToday = i === todayIndex;
        const isFuture = i > todayIndex;
        const percentage = pulse[i] || 0;

        // Determine fill level: filled (>50%), half (<= 50% but > 0), empty (0% or future)
        let fillClass = 'bg-[#325e67]'; // empty
        if (!isFuture) {
          if (percentage > 50) {
            fillClass = 'bg-[#13c8ec]'; // filled
          } else if (percentage > 0) {
            fillClass = 'bg-[#13c8ec]/50'; // half
          }
        }

        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="text-[#92c0c9] text-xs">{day}</span>
            <div
              className={`w-4 h-4 rounded-full ${fillClass} ${
                isToday ? 'ring-2 ring-white/30' : ''
              }`}
              title={isFuture ? 'Future' : `${percentage}% of class active`}
            />
          </div>
        );
      })}
    </div>
  );
}

// Format last active date
function formatLastActive(lastActive: string | null): string {
  if (!lastActive) return 'Never';

  const date = new Date(lastActive);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

// Supportive coaching messages
const supportiveMessages: Record<string, string> = {
  inactive: "Sometimes life gets busy. A quick conversation might help them get back on track.",
  brokenStreak: "Streaks break. The skill is recovering. Consider asking what got in the way.",
  dropInActivity: "This might be a good time for a check-in about any obstacles they're facing.",
};

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
      </p>

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
    </div>
  );
}

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [showAllStudents, setShowAllStudents] = useState(false);
  const [showPatternsDetail, setShowPatternsDetail] = useState(false);

  // Group rename state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

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

  const copyJoinCode = async () => {
    if (!dashboardData?.group.joinCode) return;
    try {
      await navigator.clipboard.writeText(dashboardData.group.joinCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = dashboardData.group.joinCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
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
      <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
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
      <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
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

  const { group, studentSummaries, celebrations, studentsNeedingSupport, classPulse, todayIndex, stats } = dashboardData;
  const hasStudents = studentSummaries.length > 0;

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Link
            href="/teacher/dashboard"
            className="w-8 h-8 flex items-center justify-center rounded-full text-[#92c0c9] hover:bg-white/10 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          {isEditingName ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="text-2xl md:text-3xl font-black text-white tracking-tight bg-[#192f33] border border-[#325e67] rounded-lg px-3 py-1 focus:outline-none focus:border-[#13c8ec] flex-1"
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
            <div className="flex items-center gap-2 flex-1">
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
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
            {stats.totalStudents} member{stats.totalStudents !== 1 ? 's' : ''} • {stats.totalCompletionsThisWeek} completion{stats.totalCompletionsThisWeek !== 1 ? 's' : ''} this week
          </p>
        )}
      </div>

      {/* Empty State - Prominent Join Code */}
      {!hasStudents && (
        <SectionCard className="mb-8" padding="lg">
          <JoinCodeDisplay code={group.joinCode} groupName={group.name} />
        </SectionCard>
      )}

      {/* With Students - Support-focused layout */}
      {hasStudents && (
        <div className="flex flex-col gap-8">
          {/* Celebrations Section */}
          {celebrations.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>This Week&apos;s Wins</span>
              </h2>
              <div className="flex flex-col gap-3">
                {celebrations.map((celebration, i) => (
                  <div
                    key={i}
                    className="bg-[#192f33] rounded-xl p-4 flex items-start gap-3"
                  >
                    <span className="text-xl">
                      {celebration.type === 'streak' ? '🔥' : celebration.type === 'xp' ? '⭐' : '✨'}
                    </span>
                    <p className="text-white">
                      {celebration.studentName && (
                        <span className="font-medium">{celebration.studentName} </span>
                      )}
                      {celebration.detail}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Class Pulse Section */}
          <section>
            <h2 className="text-lg font-bold text-white mb-4">Class Pulse</h2>
            <SectionCard>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-[#92c0c9] text-sm">This week</span>
                  <ClassPulseDots pulse={classPulse} todayIndex={todayIndex} />
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <span className="text-[#13c8ec] font-bold">{stats.activeStudentsThisWeek}</span>
                    <span className="text-[#92c0c9]"> of {stats.totalStudents} students active this week</span>
                  </div>
                </div>
              </div>
            </SectionCard>
          </section>

          {/* Patterns to Watch Section */}
          {studentsNeedingSupport.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">visibility</span>
                Patterns to Watch
              </h2>
              <p className="text-[#92c0c9] text-sm mb-4">
                {studentsNeedingSupport.length} student{studentsNeedingSupport.length !== 1 ? 's' : ''} might benefit from a check-in.
                Consider a general conversation about obstacles.
              </p>

              {!showPatternsDetail ? (
                <button
                  onClick={() => setShowPatternsDetail(true)}
                  className="text-[#13c8ec] hover:text-[#0ea5c7] text-sm font-medium transition-colors flex items-center gap-1"
                >
                  <span>View students who might need support</span>
                  <span className="material-symbols-outlined !text-sm">arrow_forward</span>
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  {studentsNeedingSupport.map((student) => (
                    <div
                      key={student.id}
                      className="bg-[#192f33] rounded-xl p-4 border-l-4 border-amber-500/50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#13c8ec] to-[#3b82f6] flex items-center justify-center text-white font-bold">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white font-medium">{student.name}</p>
                            <p className="text-[#92c0c9] text-sm">{student.reason}</p>
                          </div>
                        </div>
                        <Link
                          href={`/teacher/students/${student.id}?groupId=${groupId}`}
                          className="text-[#13c8ec] hover:text-[#0ea5c7] text-sm font-medium transition-colors flex items-center gap-1"
                        >
                          View
                          <span className="material-symbols-outlined !text-sm">arrow_forward</span>
                        </Link>
                      </div>
                      <p className="text-[#92c0c9]/70 text-xs mt-3 italic">
                        {student.reason.includes('days ago')
                          ? supportiveMessages.inactive
                          : student.reason.includes('habits need')
                          ? supportiveMessages.brokenStreak
                          : supportiveMessages.dropInActivity}
                      </p>
                    </div>
                  ))}
                  <button
                    onClick={() => setShowPatternsDetail(false)}
                    className="text-[#92c0c9] hover:text-white text-sm transition-colors"
                  >
                    Hide details
                  </button>
                </div>
              )}
            </section>
          )}

          {/* All Students Section - Collapsed by default */}
          <section>
            <button
              onClick={() => setShowAllStudents(!showAllStudents)}
              className="w-full flex items-center justify-between py-3 text-white hover:text-[#13c8ec] transition-colors"
            >
              <span className="font-bold">View all students ({stats.totalStudents})</span>
              <span className={`material-symbols-outlined transition-transform ${showAllStudents ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>

            {showAllStudents && (
              <div className="mt-4 flex flex-col gap-2">
                {studentSummaries
                  .sort((a, b) => {
                    // Sort by last active (most recent first)
                    if (!a.lastActive && !b.lastActive) return 0;
                    if (!a.lastActive) return 1;
                    if (!b.lastActive) return -1;
                    return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
                  })
                  .map((summary) => (
                    <Link
                      key={summary.student.id}
                      href={`/teacher/students/${summary.student.id}?groupId=${groupId}`}
                      className="bg-[#192f33] rounded-lg p-3 flex items-center justify-between hover:bg-[#1a3538] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#13c8ec] to-[#3b82f6] flex items-center justify-center text-white text-sm font-bold">
                          {summary.student.name.charAt(0)}
                        </div>
                        <span className="text-white">{summary.student.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[#92c0c9]">
                        <span>{formatLastActive(summary.lastActive)}</span>
                        <span>{summary.activeHabits} habit{summary.activeHabits !== 1 ? 's' : ''}</span>
                        <span className="material-symbols-outlined !text-lg">chevron_right</span>
                      </div>
                    </Link>
                  ))}
              </div>
            )}
          </section>

          {/* Invite Students Section */}
          <section className="border-t border-[#325e67] pt-8">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#13c8ec]">person_add</span>
              Invite Students
            </h2>
            <SectionCard>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-[#92c0c9] text-sm mb-2">Share this code with students to join:</p>
                  <p className="text-2xl font-mono font-bold text-[#13c8ec] tracking-wider">
                    {group.joinCode}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={copyJoinCode}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      copiedCode
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-[#101f22] text-white hover:bg-[#192f33]'
                    }`}
                  >
                    <span className="material-symbols-outlined !text-lg">
                      {copiedCode ? 'check' : 'content_copy'}
                    </span>
                    {copiedCode ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
              </div>
            </SectionCard>
          </section>
        </div>
      )}
    </div>
  );
}
