'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/Button';

interface LatestCelebration {
  studentName: string;
  type: 'streak' | 'completions';
  value: number;
}

interface GroupData {
  id: string;
  name: string;
  description: string | null;
  joinCode: string;
  memberCount: number;
  completionsThisWeek: number;
  activeStudentsToday: number;
  latestCelebration: LatestCelebration | null;
}

// Get contextual status line for group card
function getGroupStatusLine(group: GroupData): { text: string; icon: string } | null {
  // 0 members - invite prompt
  if (group.memberCount === 0) {
    return { text: 'Tap to invite your first students', icon: 'person_add' };
  }

  // Has celebration - show it
  if (group.latestCelebration) {
    const { studentName, type, value } = group.latestCelebration;
    if (type === 'streak') {
      return { text: `${studentName} hit a ${value}-day streak`, icon: '🔥' };
    } else {
      return { text: `${studentName} reached ${value} completions`, icon: '⭐' };
    }
  }

  // Has activity but no celebration
  if (group.completionsThisWeek > 0) {
    return { text: 'All caught up — no alerts', icon: 'check_circle' };
  }

  // Members but no activity yet
  return { text: 'Waiting for first check-ins', icon: 'schedule' };
}

// Get activity display text
function getActivityText(group: GroupData): string | null {
  if (group.memberCount === 0) return null;

  if (group.activeStudentsToday > 0) {
    return `${group.activeStudentsToday} active today`;
  }

  if (group.completionsThisWeek > 0) {
    return `${group.completionsThisWeek} this week`;
  }

  return null;
}

export default function TeacherDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [totalCompletionsToday, setTotalCompletionsToday] = useState(0);
  const [showNewGroupForm, setShowNewGroupForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Fetch teacher's groups on mount
  useEffect(() => {
    async function fetchGroups() {
      try {
        const response = await fetch('/api/groups');
        if (response.ok) {
          const data = await response.json();
          setGroups(data.groups || []);
          setTotalCompletionsToday(data.totalCompletionsToday || 0);
        } else {
          setError('Failed to load groups');
        }
      } catch (err) {
        console.error('Failed to fetch groups:', err);
        setError('Failed to load groups');
      } finally {
        setIsLoading(false);
      }
    }
    fetchGroups();
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGroupName.trim(),
          description: newGroupDescription.trim() || null,
        }),
      });

      if (response.ok) {
        const newGroup = await response.json();
        setGroups(prev => [{
          ...newGroup,
          memberCount: 0,
          completionsThisWeek: 0,
          activeStudentsToday: 0,
          latestCelebration: null,
        }, ...prev]);
        setNewGroupName('');
        setNewGroupDescription('');
        setShowNewGroupForm(false);
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to create group');
      }
    } catch (err) {
      console.error('Failed to create group:', err);
      alert('Failed to create group');
    } finally {
      setIsCreating(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#13c8ec] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-[#92c0c9]">Loading groups...</p>
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

  // Dynamic subtitle based on activity
  const subtitle = totalCompletionsToday > 0
    ? `${totalCompletionsToday} habit${totalCompletionsToday !== 1 ? 's' : ''} completed today across your groups.`
    : "Support your students' habit journeys.";

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            My Groups
          </h1>
          <p className="text-[#92c0c9] text-base">
            {subtitle}
          </p>
        </div>
        <Button icon="add_circle" onClick={() => setShowNewGroupForm(true)}>
          New Group
        </Button>
      </div>

      {/* New Group Form */}
      {showNewGroupForm && (
        <SectionCard className="mb-8">
          <form onSubmit={handleCreateGroup} className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">Create New Group</h3>
            <div>
              <label htmlFor="groupName" className="block text-sm font-medium text-[#92c0c9] mb-2">
                Group Name *
              </label>
              <input
                id="groupName"
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="e.g., G5 Wellbeing"
                className="w-full px-4 py-2 bg-[#101f22] border border-[#325e67] rounded-lg text-white placeholder-[#92c0c9]/50 focus:outline-none focus:border-[#13c8ec]"
                required
              />
            </div>
            <div>
              <label htmlFor="groupDescription" className="block text-sm font-medium text-[#92c0c9] mb-2">
                Description (optional)
              </label>
              <input
                id="groupDescription"
                type="text"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                placeholder="e.g., Building healthy habits together"
                className="w-full px-4 py-2 bg-[#101f22] border border-[#325e67] rounded-lg text-white placeholder-[#92c0c9]/50 focus:outline-none focus:border-[#13c8ec]"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isCreating || !newGroupName.trim()}>
                {isCreating ? 'Creating...' : 'Create Group'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowNewGroupForm(false);
                  setNewGroupName('');
                  setNewGroupDescription('');
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </SectionCard>
      )}

      {/* Empty State */}
      {groups.length === 0 && !showNewGroupForm && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <span className="material-symbols-outlined text-5xl text-[#92c0c9] mb-4">group</span>
            <h2 className="text-2xl font-bold text-white mb-2">No Groups Yet</h2>
            <p className="text-[#92c0c9] mb-6">
              Create your first group to start supporting students on their habit journeys.
            </p>
            <Button icon="add_circle" onClick={() => setShowNewGroupForm(true)}>
              Create Your First Group
            </Button>
          </div>
        </div>
      )}

      {/* Groups Grid */}
      {groups.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => {
            const statusLine = getGroupStatusLine(group);
            const activityText = getActivityText(group);

            return (
              <Link
                key={group.id}
                href={`/teacher/groups/${group.id}`}
                className="block group"
              >
                <SectionCard className="h-full transition-all hover:border-[#13c8ec]/50 hover:shadow-lg hover:shadow-[#13c8ec]/10 hover:-translate-y-0.5">
                  <div className="flex flex-col h-full">
                    {/* Group Header */}
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-white truncate group-hover:text-[#13c8ec] transition-colors">
                        {group.name}
                      </h3>
                      <span className="material-symbols-outlined text-[#92c0c9] group-hover:text-[#13c8ec] transition-colors flex-shrink-0">
                        chevron_right
                      </span>
                    </div>

                    {/* Activity Stats */}
                    <div className="flex items-center gap-2 text-sm text-[#92c0c9] mb-4">
                      <span className="flex items-center gap-1">
                        <span className="text-base">👥</span>
                        {group.memberCount} member{group.memberCount !== 1 ? 's' : ''}
                      </span>
                      {activityText && (
                        <>
                          <span className="text-[#325e67]">•</span>
                          <span className="flex items-center gap-1">
                            <span className="text-base">✨</span>
                            {activityText}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Status Line */}
                    {statusLine && (
                      <div className="mt-auto pt-3 border-t border-[#325e67]">
                        <div className="flex items-center gap-2 text-sm">
                          {statusLine.icon.length <= 2 ? (
                            <span className="text-base">{statusLine.icon}</span>
                          ) : (
                            <span className={`material-symbols-outlined !text-lg ${
                              statusLine.icon === 'check_circle' ? 'text-green-400' :
                              statusLine.icon === 'person_add' ? 'text-[#13c8ec]' :
                              'text-[#92c0c9]'
                            }`}>
                              {statusLine.icon}
                            </span>
                          )}
                          <span className={`${
                            statusLine.icon === 'person_add' ? 'text-[#13c8ec]' : 'text-[#92c0c9]'
                          }`}>
                            {statusLine.text}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </SectionCard>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
