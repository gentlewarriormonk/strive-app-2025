'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface OnboardingCheckProps {
  children: React.ReactNode;
}

export function OnboardingCheck({ children }: OnboardingCheckProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Skip check if not authenticated or on certain pages
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      setIsChecking(false);
      return;
    }

    // Skip if already on onboarding, login, or API routes
    if (pathname === '/onboarding' || pathname === '/login' || pathname.startsWith('/api')) {
      setIsChecking(false);
      return;
    }

    // Check if user needs onboarding
    async function checkOnboarding() {
      try {
        const response = await fetch('/api/user/role');
        if (response.ok) {
          const data = await response.json();
          if (data.needsOnboarding) {
            router.replace('/onboarding');
            return;
          }
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
      }
      setIsChecking(false);
    }

    checkOnboarding();
  }, [status, pathname, router]);

  // Show loading while checking authentication or onboarding
  if (status === 'loading' || (status === 'authenticated' && isChecking && pathname !== '/onboarding')) {
    return (
      <div className="min-h-screen bg-[#101f22] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#13c8ec] border-t-transparent rounded-full" />
      </div>
    );
  }

  return <>{children}</>;
}
