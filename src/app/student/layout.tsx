'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { currentStudent } from '@/lib/mockData';
import { AppHeader } from '@/components/layout/AppHeader';
import { User } from '@/types/models';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
  const user: User = session?.user
    ? {
        id: session.user.id,
        name: session.user.name || 'User',
        email: session.user.email || '',
        avatarUrl: session.user.image || undefined,
        role: (session.user.role as User['role']) || 'STUDENT',
        schoolId: session.user.schoolId,
        xp: session.user.xp || 0,
        level: session.user.level || 1,
        createdAt: new Date(),
      }
    : currentStudent;

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#101f22] overflow-x-hidden">
      <AppHeader user={user} showStudentNav />
      {children}
    </div>
  );
}



