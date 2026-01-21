'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { User } from '@/types/models';

interface AppHeaderProps {
  user: User;
  showStudentNav?: boolean;
}

export function AppHeader({ user, showStudentNav = false }: AppHeaderProps) {
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Unified nav items - same labels for all roles
  const navItems = [
    { key: 'habits', label: 'My Habits', href: '/student/today', icon: 'check_circle' },
    { key: 'journey', label: 'My Journey', href: '/student/progress', icon: 'trending_up' },
    { key: 'groups', label: 'My Groups', href: '/student/group', icon: 'group' },
  ];

  // Determine active tab from pathname
  const getActiveTab = () => {
    if (pathname.startsWith('/student/today') || pathname.startsWith('/student/habits')) return 'habits';
    if (pathname.startsWith('/student/progress') || pathname.startsWith('/student/journey')) return 'journey';
    if (pathname.startsWith('/student/group') || pathname.startsWith('/student/profile')) return 'groups';
    return null;
  };
  
  const activeTab = getActiveTab();

  return (
    <header className="sticky top-0 z-10 w-full bg-[#192f33]/80 backdrop-blur-sm border-b border-[#325e67]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/student/today" className="flex items-center">
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
              {navItems.map((item) => (
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
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
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
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-[#192f33] border border-[#325e67] rounded-lg shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-[#325e67]">
                    <p className="text-sm font-medium text-white truncate">{user.name}</p>
                    <p className="text-xs text-[#92c0c9] truncate">{user.email}</p>
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
      </div>

      {/* Mobile Navigation */}
      {showStudentNav && (
        <nav className="md:hidden flex items-center justify-center gap-1 bg-[#101f22] p-1 mx-4 mb-4 rounded-full">
          {navItems.map((item) => (
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

