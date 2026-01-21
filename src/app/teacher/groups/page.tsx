'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { GroupForm } from '@/components/groups/GroupForm';
import { Group } from '@/types/models';

type GroupWithCount = Group & { memberCount: number };

export default function TeacherGroupsPage() {
  const [groups, setGroups] = useState<GroupWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showGroupForm, setShowGroupForm] = useState(false);

  // Fetch groups from API
  useEffect(() => {
    async function fetchGroups() {
      try {
        const response = await fetch('/api/groups');
        if (response.ok) {
          const data = await response.json();
          const groupsList = data.groups || [];
          setGroups(groupsList.map((g: GroupWithCount & { createdAt: string }) => ({
            ...g,
            createdAt: new Date(g.createdAt),
          })));
        }
      } catch (error) {
        console.error('Failed to fetch groups:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchGroups();
  }, []);

  // Handle creating a new group
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
    setGroups(prev => [{
      ...newGroup,
      createdAt: new Date(newGroup.createdAt),
      memberCount: 0,
    }, ...prev]);
  }, []);

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">My Groups</h1>
            <p className="text-[#92c0c9] mt-1">
              {groups.length === 0
                ? 'Create a group to start supporting student growth'
                : `${groups.length} group${groups.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={() => setShowGroupForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#13c8ec] text-[#101f22] font-bold hover:bg-[#0ea5c7] transition-colors text-sm"
          >
            <span className="material-symbols-outlined !text-lg">add</span>
            New Group
          </button>
        </div>

        {/* Groups List */}
        {isLoading ? (
          <div className="bg-[#192f33] rounded-xl p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#13c8ec] border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-[#92c0c9]">Loading your groups...</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="bg-[#192f33] rounded-xl p-8 text-center">
            <span className="material-symbols-outlined text-5xl text-[#92c0c9] mb-4">group_add</span>
            <h2 className="text-xl font-bold text-white mb-2">No groups yet</h2>
            <p className="text-[#92c0c9] text-sm mb-6 max-w-md mx-auto">
              Create your first group to invite students and start tracking their wellbeing habits together.
            </p>
            <button
              onClick={() => setShowGroupForm(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#13c8ec] text-[#101f22] font-bold hover:bg-[#0ea5c7] transition-colors"
            >
              <span className="material-symbols-outlined !text-lg">add</span>
              Create Your First Group
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {groups.map((group) => (
              <Link
                key={group.id}
                href={`/teacher/groups/${group.id}`}
                className="bg-[#192f33] rounded-xl p-5 hover:bg-[#1e3a3f] transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#13c8ec]/20 to-[#3b82f6]/20 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[#13c8ec]">group</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-white truncate group-hover:text-[#13c8ec] transition-colors">
                        {group.name}
                      </h3>
                    </div>
                    {group.description && (
                      <p className="text-[#92c0c9] text-sm truncate mt-0.5">{group.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[#92c0c9] text-xs flex items-center gap-1">
                        <span className="material-symbols-outlined !text-sm">person</span>
                        {group.memberCount} member{group.memberCount !== 1 ? 's' : ''}
                      </span>
                      {group.joinCode && (
                        <span className="text-[#92c0c9] text-xs flex items-center gap-1">
                          <span className="material-symbols-outlined !text-sm">tag</span>
                          {group.joinCode}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[#92c0c9] group-hover:text-white transition-colors">
                    chevron_right
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Helpful Tips */}
        {groups.length > 0 && (
          <div className="bg-[#192f33]/50 rounded-xl p-5 border border-[#325e67]">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#13c8ec] mt-0.5">tips_and_updates</span>
              <div>
                <p className="text-white font-medium text-sm mb-1">Quick Tips</p>
                <ul className="text-[#92c0c9] text-xs space-y-1">
                  <li>Share your group&apos;s join code with students to add them</li>
                  <li>Check in regularly to see who might need support</li>
                  <li>Celebrate wins - recognition builds momentum</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Group Form Modal */}
      {showGroupForm && (
        <GroupForm
          onClose={() => setShowGroupForm(false)}
          onSubmit={handleCreateGroup}
        />
      )}
    </div>
  );
}
