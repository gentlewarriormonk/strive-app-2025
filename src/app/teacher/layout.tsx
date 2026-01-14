'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { currentTeacher, groups } from '@/lib/mockData';
import { Button } from '@/components/ui/Button';
import { User } from '@/types/models';

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're sure there's no session (not while loading)
    if (status === 'unauthenticated') {
      // For demo mode, allow access without auth
      // Remove this check to enforce authentication
    }
  }, [status, router]);

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
  const currentGroup = groups.find((g) => g.id === currentGroupId);

  // Teacher's groups (using mock data for now, would be fetched from DB in production)
  const teacherGroups = groups.filter((g) => g.teacherId === currentTeacher.id);

  return (
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
                My Groups
              </p>
              <div className="flex flex-col gap-1">
                {teacherGroups.map((group) => {
                  const isActive = pathname.includes(`/teacher/groups/${group.id}`) || 
                    (pathname === '/teacher/dashboard' && group.id === 'group-1');
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
                })}
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col gap-3">
            <Button icon="add" fullWidth>
              New group
            </Button>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#192f33]">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#13c8ec] to-[#3b82f6] flex items-center justify-center text-white font-bold">
                {teacher.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{teacher.name}</p>
                <p className="text-[#92c0c9] text-xs">Level {teacher.level}</p>
              </div>
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
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#13c8ec] to-[#3b82f6] flex items-center justify-center text-white text-sm font-bold">
              {teacher.name.charAt(0)}
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
  );
}

