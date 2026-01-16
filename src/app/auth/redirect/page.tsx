'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function AuthRedirectPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkRoleAndRedirect() {
      // Wait for session to load
      if (status === 'loading') return;

      // If no session, redirect to login
      if (status === 'unauthenticated' || !session) {
        router.replace('/login');
        return;
      }

      try {
        // Check user's role and onboarding status
        const response = await fetch('/api/user/role');

        if (!response.ok) {
          throw new Error('Failed to check user role');
        }

        const data = await response.json();

        // If user needs onboarding (no role set), redirect to onboarding
        if (data.needsOnboarding) {
          router.replace('/onboarding');
          return;
        }

        // Redirect based on role
        if (data.role === 'TEACHER') {
          router.replace('/teacher/dashboard');
        } else {
          router.replace('/student/today');
        }
      } catch (err) {
        console.error('Error checking role:', err);
        setError('Something went wrong. Please try again.');
      }
    }

    checkRoleAndRedirect();
  }, [session, status, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1a1c]">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.replace('/login')}
            className="text-[#13c8ec] hover:underline"
          >
            Return to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1a1c]">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#13c8ec] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-[#92c0c9]">Setting up your account...</p>
      </div>
    </div>
  );
}
