'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const [isLoading, setIsLoading] = useState<'TEACHER' | 'STUDENT' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRoleSelection = async (role: 'TEACHER' | 'STUDENT') => {
    setIsLoading(role);
    setError(null);

    try {
      const response = await fetch('/api/user/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      // Update the session to reflect the new role
      await updateSession({ role });

      // Redirect based on role
      if (role === 'TEACHER') {
        router.push('/teacher/dashboard');
      } else {
        router.push('/student/today');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#101f22] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/strive-logo-white-on-transparent.png"
            alt="Strive"
            width={160}
            height={40}
            className="h-10 w-auto object-contain"
          />
        </div>

        {/* Welcome Card */}
        <div className="bg-[#192f33] rounded-2xl p-8 border border-[#325e67]/50">
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Welcome to Strive!
          </h1>
          <p className="text-[#92c0c9] text-center mb-8">
            {session?.user?.name ? `Hi ${session.user.name.split(' ')[0]}! ` : ''}
            Let&apos;s get you set up. What best describes you?
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-6">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Teacher Option */}
            <button
              onClick={() => handleRoleSelection('TEACHER')}
              disabled={isLoading !== null}
              className="w-full p-6 rounded-xl bg-[#101f22] border-2 border-[#325e67] hover:border-[#13c8ec] transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-2xl">
                    school
                  </span>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-semibold text-white group-hover:text-[#13c8ec] transition-colors">
                    I&apos;m a Teacher
                  </h3>
                  <p className="text-sm text-[#92c0c9]">
                    Create classes and guide students
                  </p>
                </div>
                {isLoading === 'TEACHER' ? (
                  <div className="animate-spin w-6 h-6 border-2 border-[#13c8ec] border-t-transparent rounded-full" />
                ) : (
                  <span className="material-symbols-outlined text-[#325e67] group-hover:text-[#13c8ec] transition-colors">
                    arrow_forward
                  </span>
                )}
              </div>
            </button>

            {/* Student Option */}
            <button
              onClick={() => handleRoleSelection('STUDENT')}
              disabled={isLoading !== null}
              className="w-full p-6 rounded-xl bg-[#101f22] border-2 border-[#325e67] hover:border-[#13c8ec] transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#13c8ec] to-[#3b82f6] flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-2xl">
                    person
                  </span>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-semibold text-white group-hover:text-[#13c8ec] transition-colors">
                    I&apos;m a Student
                  </h3>
                  <p className="text-sm text-[#92c0c9]">
                    Track habits and join a class
                  </p>
                </div>
                {isLoading === 'STUDENT' ? (
                  <div className="animate-spin w-6 h-6 border-2 border-[#13c8ec] border-t-transparent rounded-full" />
                ) : (
                  <span className="material-symbols-outlined text-[#325e67] group-hover:text-[#13c8ec] transition-colors">
                    arrow_forward
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        <p className="text-[#92c0c9]/60 text-sm text-center mt-6">
          You can change this later in settings
        </p>
      </div>
    </div>
  );
}
