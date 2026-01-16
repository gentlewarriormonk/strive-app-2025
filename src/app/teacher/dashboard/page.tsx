'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/Button';

interface GroupData {
  id: string;
  name: string;
  description: string | null;
  joinCode: string;
  memberCount?: number;
}

export default function TeacherDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [showNewClassForm, setShowNewClassForm] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassDescription, setNewClassDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Fetch teacher's groups on mount
  useEffect(() => {
    async function fetchGroups() {
      try {
        const response = await fetch('/api/groups');
        if (response.ok) {
          const data = await response.json();
          setGroups(data);
        } else {
          setError('Failed to load classes');
        }
      } catch (err) {
        console.error('Failed to fetch groups:', err);
        setError('Failed to load classes');
      } finally {
        setIsLoading(false);
      }
    }
    fetchGroups();
  }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newClassName.trim(),
          description: newClassDescription.trim() || null,
        }),
      });

      if (response.ok) {
        const newGroup = await response.json();
        setGroups(prev => [...prev, newGroup]);
        setNewClassName('');
        setNewClassDescription('');
        setShowNewClassForm(false);
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to create class');
      }
    } catch (err) {
      console.error('Failed to create class:', err);
      alert('Failed to create class');
    } finally {
      setIsCreating(false);
    }
  };

  const copyJoinCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#13c8ec] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-[#92c0c9]">Loading classes...</p>
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

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            My Classes
          </h1>
          <p className="text-[#92c0c9] text-base">
            Manage your classes and track student progress.
          </p>
        </div>
        <Button icon="add_circle" onClick={() => setShowNewClassForm(true)}>
          New Class
        </Button>
      </div>

      {/* New Class Form */}
      {showNewClassForm && (
        <SectionCard className="mb-8">
          <form onSubmit={handleCreateClass} className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">Create New Class</h3>
            <div>
              <label htmlFor="className" className="block text-sm font-medium text-[#92c0c9] mb-2">
                Class Name *
              </label>
              <input
                id="className"
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="e.g., G5 Wellbeing"
                className="w-full px-4 py-2 bg-[#101f22] border border-[#325e67] rounded-lg text-white placeholder-[#92c0c9]/50 focus:outline-none focus:border-[#13c8ec]"
                required
              />
            </div>
            <div>
              <label htmlFor="classDescription" className="block text-sm font-medium text-[#92c0c9] mb-2">
                Description (optional)
              </label>
              <input
                id="classDescription"
                type="text"
                value={newClassDescription}
                onChange={(e) => setNewClassDescription(e.target.value)}
                placeholder="e.g., Grade 5 morning class"
                className="w-full px-4 py-2 bg-[#101f22] border border-[#325e67] rounded-lg text-white placeholder-[#92c0c9]/50 focus:outline-none focus:border-[#13c8ec]"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isCreating || !newClassName.trim()}>
                {isCreating ? 'Creating...' : 'Create Class'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowNewClassForm(false);
                  setNewClassName('');
                  setNewClassDescription('');
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </SectionCard>
      )}

      {/* Empty State */}
      {groups.length === 0 && !showNewClassForm && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <span className="material-symbols-outlined text-5xl text-[#92c0c9] mb-4">school</span>
            <h2 className="text-2xl font-bold text-white mb-2">No Classes Yet</h2>
            <p className="text-[#92c0c9] mb-6">
              Create your first class to start tracking student habits and well-being.
            </p>
            <Button icon="add_circle" onClick={() => setShowNewClassForm(true)}>
              Create Your First Class
            </Button>
          </div>
        </div>
      )}

      {/* Classes Grid */}
      {groups.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Link
              key={group.id}
              href={`/teacher/groups/${group.id}`}
              className="block group"
            >
              <SectionCard className="h-full transition-all hover:border-[#13c8ec]/50 hover:shadow-lg hover:shadow-[#13c8ec]/10">
                <div className="flex flex-col h-full">
                  {/* Class Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-white truncate group-hover:text-[#13c8ec] transition-colors">
                        {group.name}
                      </h3>
                      {group.description && (
                        <p className="text-[#92c0c9] text-sm mt-1 truncate">
                          {group.description}
                        </p>
                      )}
                    </div>
                    <span className="material-symbols-outlined text-[#92c0c9] group-hover:text-[#13c8ec] transition-colors">
                      chevron_right
                    </span>
                  </div>

                  {/* Student Count */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-[#92c0c9] !text-lg">group</span>
                    <span className="text-[#92c0c9] text-sm">
                      {group.memberCount ?? 0} student{(group.memberCount ?? 0) !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Join Code */}
                  <div className="mt-auto pt-4 border-t border-[#325e67]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#92c0c9] text-xs mb-1">Join Code</p>
                        <p className="text-lg font-mono font-bold text-[#13c8ec]">
                          {group.joinCode}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          copyJoinCode(group.joinCode);
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-[#92c0c9] hover:bg-white/10 hover:text-white transition-colors"
                        aria-label="Copy join code"
                      >
                        <span className="material-symbols-outlined !text-lg">content_copy</span>
                      </button>
                    </div>
                  </div>
                </div>
              </SectionCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
