'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { SectionCard } from '@/components/ui/SectionCard';

interface Student {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  xp: number;
  level: number;
  joinedAt: string;
}

interface GroupData {
  id: string;
  name: string;
  description: string | null;
  joinCode: string;
  createdAt: string;
  students: Student[];
  memberCount: number;
  teacher: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = params.id as string;

  const [group, setGroup] = useState<GroupData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    async function fetchGroup() {
      try {
        const response = await fetch(`/api/groups/${groupId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Class not found');
          } else {
            setError('Failed to load class');
          }
          return;
        }
        const data = await response.json();
        setGroup(data);
      } catch (err) {
        setError('Failed to load class');
      } finally {
        setIsLoading(false);
      }
    }

    if (groupId) {
      fetchGroup();
    }
  }, [groupId]);

  const copyJoinCode = async () => {
    if (!group) return;
    try {
      await navigator.clipboard.writeText(group.joinCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-[#13c8ec] border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="p-6 md:p-8">
        <div className="bg-[#192f33] rounded-xl p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-red-400 mb-3">error</span>
          <p className="text-white font-medium">{error || 'Class not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{group.name}</h1>
            {group.description && (
              <p className="text-[#92c0c9]">{group.description}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Students List */}
            <SectionCard title={`Students (${group.memberCount})`}>
              {group.students.length === 0 ? (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-4xl text-[#92c0c9] mb-3">
                    group_add
                  </span>
                  <p className="text-white font-medium mb-2">No students yet</p>
                  <p className="text-[#92c0c9] text-sm mb-4">
                    Share the join code with your students to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {group.students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-[#101f22] hover:bg-[#182a2e] transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#13c8ec] to-[#3b82f6] flex items-center justify-center text-white font-bold">
                        {student.name?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">
                          {student.name || 'Unknown'}
                        </p>
                        <p className="text-[#92c0c9] text-sm truncate">
                          {student.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">Level {student.level}</p>
                        <p className="text-[#92c0c9] text-xs">{student.xp} XP</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Join Code Card */}
            <SectionCard title="Join Code">
              <div className="text-center">
                <div className="bg-[#101f22] rounded-lg p-4 mb-4">
                  <p className="text-3xl font-mono font-bold text-[#13c8ec] tracking-wider">
                    {group.joinCode}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    fullWidth
                    icon={copiedCode ? 'check' : 'content_copy'}
                    onClick={copyJoinCode}
                  >
                    {copiedCode ? 'Copied!' : 'Copy Code'}
                  </Button>
                </div>
                <p className="text-[#92c0c9] text-xs mt-4">
                  Students can use this code to join your class
                </p>
              </div>
            </SectionCard>

            {/* Class Stats */}
            <SectionCard title="Class Stats">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-[#101f22] rounded-lg">
                  <span className="text-[#92c0c9]">Total Students</span>
                  <span className="text-white font-bold">{group.memberCount}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#101f22] rounded-lg">
                  <span className="text-[#92c0c9]">Join Code</span>
                  <span className="text-white font-mono">{group.joinCode}</span>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
