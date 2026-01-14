'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { User } from '@/types/models';

interface AppHeaderProps {
  user: User;
  showStudentNav?: boolean;
}

export function AppHeader({ user, showStudentNav = false }: AppHeaderProps) {
  const pathname = usePathname();
  
  const studentNavItems = [
    { key: 'today', label: 'Today', href: '/student/today' },
    { key: 'progress', label: 'Progress', href: '/student/progress' },
    { key: 'group', label: 'Group', href: '/student/group' },
  ];

  // Determine active tab from pathname
  const getActiveTab = () => {
    if (pathname.startsWith('/student/today')) return 'today';
    if (pathname.startsWith('/student/progress')) return 'progress';
    if (pathname.startsWith('/student/group') || pathname.startsWith('/student/profile')) return 'group';
    return null;
  };
  
  const activeTab = getActiveTab();

  return (
    <header className="sticky top-0 z-10 w-full bg-[#192f33]/80 backdrop-blur-sm border-b border-[#325e67]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={user.role === 'TEACHER' ? '/teacher/dashboard' : '/student/today'} className="flex items-center">
              <Image
                src="/strive-logo-white-on-transparent.png"
                alt="Strive"
                width={128}
                height={32}
                className="h-8 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Student Navigation (Desktop) */}
          {showStudentNav && (
            <nav className="hidden md:flex items-center gap-1 bg-[#101f22] p-1 rounded-full">
              {studentNavItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`nav-pill ${activeTab === item.key ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <button 
              className="hidden sm:flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 text-[#92c0c9]/50 cursor-not-allowed"
              aria-disabled="true"
              title="Coming soon"
            >
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium text-white">{user.name}</span>
                <span className="text-xs text-[#92c0c9]">Level {user.level}</span>
              </div>
              <div
                className="w-10 h-10 rounded-full bg-gradient-to-br from-[#13c8ec] to-[#3b82f6] flex items-center justify-center text-white font-bold"
                title={user.name}
              >
                {user.name.charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {showStudentNav && (
        <nav className="md:hidden flex items-center justify-center gap-1 bg-[#101f22] p-1 mx-4 mb-4 rounded-full">
          {studentNavItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`nav-pill flex-1 text-center ${activeTab === item.key ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

