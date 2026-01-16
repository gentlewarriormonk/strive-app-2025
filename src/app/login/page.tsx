'use client';

import Link from 'next/link';
import Image from 'next/image';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (session?.user) {
      const role = session.user.role;
      if (role === 'TEACHER' || role === 'SCHOOL_ADMIN' || role === 'PLATFORM_ADMIN') {
        router.push('/teacher/dashboard');
      } else {
        router.push('/student/today');
      }
    }
  }, [session, router]);

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/auth/redirect' });
  };

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="relative flex h-auto min-h-screen w-full flex-col text-white overflow-x-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#061518] via-[#101f22] to-[#0b282e]" />
        <div className="flex flex-1 justify-center items-center">
          <div className="animate-pulse text-[#92c0c9]">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col text-white overflow-x-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#061518] via-[#101f22] to-[#0b282e]" />

      <div className="flex flex-1 justify-center items-center py-5 px-4">
        <div className="flex flex-col w-full max-w-sm">
          <div className="flex flex-col items-center gap-8 rounded-2xl bg-[#132c31]/50 p-8 shadow-2xl backdrop-blur-xl border border-white/10">
            <Image
              src="/strive-logo-white-on-transparent.png"
              alt="Strive"
              width={200}
              height={50}
              className="h-9 w-auto max-w-[200px] mx-auto object-contain"
              priority
            />

            <div className="w-full space-y-4">
              {/* Google Sign In */}
              <button
                onClick={handleGoogleSignIn}
                className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-white hover:bg-gray-100 active:bg-gray-200 transition-colors text-[#101f22] gap-3 text-base font-bold"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25C22.56 11.42 22.49 10.62 22.36 9.85H12.27V14.4H18.1C17.84 16.02 17.03 17.39 15.72 18.28V21.09H19.6C21.56 19.23 22.56 16.03 22.56 12.25Z" fill="#4285F4" />
                  <path d="M12.27 23C15.11 23 17.5 22.14 19.16 20.73L15.72 18.28C14.77 18.93 13.62 19.33 12.27 19.33C9.68 19.33 7.45 17.65 6.64 15.28H2.68V18.18C4.34 21.14 8.01 23 12.27 23Z" fill="#34A853" />
                  <path d="M6.64 15.28C6.39 14.56 6.25 13.79 6.25 13C6.25 12.21 6.39 11.44 6.64 10.72V7.82H2.68C1.86 9.4 1.43 11.14 1.43 13C1.43 14.86 1.86 16.6 2.68 18.18L6.64 15.28Z" fill="#FBBC05" />
                  <path d="M12.27 6.67C13.71 6.67 14.86 7.14 15.77 8.02L19.23 4.71C17.5 3.09 15.11 2 12.27 2C8.01 2 4.34 4.86 2.68 7.82L6.64 10.72C7.45 8.35 9.68 6.67 12.27 6.67Z" fill="#EA4335" />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Demo Links */}
              <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                <p className="text-xs text-[#92c0c9] text-center mb-2">Demo access:</p>
                <Link
                  href="/student/today"
                  className="flex w-full items-center justify-center rounded-lg h-10 px-4 bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
                >
                  <span className="material-symbols-outlined mr-2 !text-lg">person</span>
                  Continue as Student
                </Link>
                <Link
                  href="/teacher/dashboard"
                  className="flex w-full items-center justify-center rounded-lg h-10 px-4 bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
                >
                  <span className="material-symbols-outlined mr-2 !text-lg">school</span>
                  Continue as Teacher
                </Link>
              </div>
            </div>
          </div>

          <p className="text-[#92c0c9] hover:text-white transition-colors text-sm text-center pt-6">
            <Link href="/">‹ Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

