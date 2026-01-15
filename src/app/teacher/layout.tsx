'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { currentTeacher } from '@/lib/mockData';
import { Button } from '@/components/ui/Button';
import { OnboardingCheck } from '@/components/auth/OnboardingCheck';
import { GroupForm } from '@/components/groups/GroupForm';
import { User, Group } from '@/types/models';

type GroupWithCount = Group & { memberCount: number };

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();

  // State for groups
  const [teacherGroups, setTeacherGroups] = useState<GroupWithCount[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [showGroupForm, setShowGroupForm] = useState(false);

  // State for user menu dropdown
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fetch groups from API
  useEffect(() => {
    async function fetchGroups() {
      try {
        const response = await fetch('/api/groups');
        if (response.ok) {
          const groups = await response.json();
          setTeacherGroups(groups.map((g: GroupWithCount & { createdAt: string }) => ({
            ...g,
            createdAt: new Date(g.createdAt),
          })));
        }
      } catch (error) {
        console.error('Failed to fetch groups:', error);
      } finally {
        setIsLoadingGroups(false);
      }
    }
    if (status === 'authenticated') {
      fetchGroups();
    }
  }, [status]);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
    setTeacherGroups(prev => [{
      ...newGroup,
      createdAt: new Date(newGroup.createdAt),
      memberCount: 0,
    }, ...prev]);
  }, []);

  // Build user object from session or fall back to mock for demo
  const teacher: User = session?.user
    ? {
        id: session.user.id,
        name: session.user.name || 'User',
        email: session.user.email || '',
        avatarUrl: session.user.image || undefined,
        role: (session.user.role as User['role']) || 'TEACHER',
        schoolId: session.user.schoolId,
        xp: session.user.xp || 0,
        level: session.user.level || 1,
        createdAt: new Date(),
      }
    : currentTeacher;

  // Get current group from pathname if on groups page
  const currentGroupId = pathname.match(/\/teacher\/groups\/([^/]+)/)?.[1];

  return (
    <OnboardingCheck>
      <div className="relative flex min-h-screen w-full bg-[#101f22]">
        {/* Side Navigation */}
        <aside className="hidden md:flex w-full max-w-xs flex-col border-r border-[#325e67] bg-[#111f22]">
        <div className="flex h-full flex-col justify-between p-4">
          <div className="flex flex-col gap-4">
            {/* Logo and Title */}
            <div className="flex flex-col gap-1">
              <Image
                src="/strive-logo-white-on-transparent.png"
                alt="Strive"
                width={128}
                height={32}
                className="h-8 w-auto object-contain"
              />
              <p className="text-[#92c0c9] text-sm">Teacher Dashboard</p>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col gap-1 mt-2">
              <Link
                href="/teacher/dashboard"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                  pathname === '/teacher/dashboard'
                    ? 'bg-[#234248] text-white'
                    : 'text-[#92c0c9] hover:bg-[#234248] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined">dashboard</span>
                <span className="text-sm font-medium">Dashboard</span>
              </Link>
              <Link
                href="/teacher/habits"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                  pathname === '/teacher/habits'
                    ? 'bg-[#234248] text-white'
                    : 'text-[#92c0c9] hover:bg-[#234248] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined">check_circle</span>
                <span className="text-sm font-medium">My Habits</span>
              </Link>
            </nav>

            {/* Groups Section */}
            <div className="mt-6">
              <p className="text-xs font-medium text-[#92c0c9] uppercase tracking-wider mb-2 px-3">
                My Classes
              </p>
              <div className="flex flex-col gap-1">
                {isLoadingGroups ? (
                  <div className="px-3 py-2 text-[#92c0c9] text-sm">Loading...</div>
                ) : teacherGroups.length === 0 ? (
                  <div className="px-3 py-2 text-[#92c0c9] text-sm">No classes yet</div>
                ) : (
                  teacherGroups.map((group) => {
                    const isActive = pathname.includes(`/teacher/groups/${group.id}`);
                    return (
                      <Link
                        key={group.id}
                        href={`/teacher/groups/${group.id}`}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                          isActive
                            ? 'bg-[#234248] text-white'
                            : 'text-[#92c0c9] hover:bg-[#234248] hover:text-white'
                        }`}
                      >
                        <span className={`material-symbols-outlined ${isActive ? 'fill' : ''}`}>
                          group
                        </span>
                        <span className="text-sm font-medium">{group.name}</span>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col gap-3">
            <Button icon="add" fullWidth onClick={() => setShowGroupForm(true)}>
              New Class
            </Button>
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#192f33] hover:bg-[#234248] transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#13c8ec] to-[#3b82f6] flex items-center justify-center text-white font-bold">
                  {teacher.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-white text-sm font-medium truncate">{teacher.name}</p>
                  <p className="text-[#92c0c9] text-xs">Level {teacher.level}</p>
                </div>
                <span className="material-symbols-outlined text-[#92c0c9]">
                  {showUserMenu ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#192f33] border border-[#325e67] rounded-lg shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-[#325e67]">
                    <p className="text-sm font-medium text-white truncate">{teacher.name}</p>
                    <p className="text-xs text-[#92c0c9] truncate">{teacher.email}</p>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full px-4 py-2 text-left text-sm text-[#92c0c9] hover:bg-[#325e67] hover:text-white flex items-center gap-2 transition-colors"
                  >
                    <span className="material-symbols-outlined !text-lg">logout</span>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-10 bg-[#192f33]/80 backdrop-blur-sm border-b border-[#325e67] px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image
                src="/strive-logo-white-on-transparent.png"
                alt="Strive"
                width={128}
                height={32}
                className="h-8 w-auto object-contain"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-[#13c8ec] to-[#3b82f6] flex items-center justify-center text-white text-sm font-bold"
              >
                {teacher.name.charAt(0)}
              </button>

              {/* Mobile Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-[#192f33] border border-[#325e67] rounded-lg shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-[#325e67]">
                    <p className="text-sm font-medium text-white truncate">{teacher.name}</p>
                    <p className="text-xs text-[#92c0c9] truncate">{teacher.email}</p>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full px-4 py-2 text-left text-sm text-[#92c0c9] hover:bg-[#325e67] hover:text-white flex items-center gap-2 transition-colors"
                  >
                    <span className="material-symbols-outlined !text-lg">logout</span>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Mobile Navigation */}
          <nav className="flex gap-2 mt-3 overflow-x-auto pb-1">
            <Link
              href="/teacher/dashboard"
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                pathname === '/teacher/dashboard'
                  ? 'bg-[#234248] text-white'
                  : 'text-[#92c0c9]'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/teacher/habits"
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                pathname === '/teacher/habits'
                  ? 'bg-[#234248] text-white'
                  : 'text-[#92c0c9]'
              }`}
            >
              My Habits
            </Link>
            {teacherGroups.map((group) => (
              <Link
                key={group.id}
                href={`/teacher/groups/${group.id}`}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  pathname.includes(`/teacher/groups/${group.id}`)
                    ? 'bg-[#234248] text-white'
                    : 'text-[#92c0c9]'
                }`}
              >
                {group.name}
              </Link>
            ))}
          </nav>
        </header>

        {children}
      </main>
    </div>

    {/* Group Form Modal */}
    {showGroupForm && (
      <GroupForm
        onClose={() => setShowGroupForm(false)}
        onSubmit={handleCreateGroup}
      />
    )}
    </OnboardingCheck>
  );
}

