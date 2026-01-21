'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';

export default function StoryPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <div
      className="relative flex min-h-screen w-full flex-col overflow-x-hidden"
      style={{
        backgroundImage: 'radial-gradient(circle at top, #101f22, #0d191b, #010409)',
      }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-4 sm:px-8 md:px-20 lg:px-40 py-5">
          <div className="flex w-full max-w-[900px] flex-1 flex-col">
            <PublicHeader />

            <main className="flex flex-col gap-16 py-20">
              {/* Hero */}
              <section className="flex flex-col gap-4">
                <h1 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-tight">
                  Built by a teacher, for real classrooms
                </h1>
              </section>

              {/* Section 1: The Class */}
              <section className="flex flex-col gap-6">
                <h2 className="text-[#13c8ec] text-xl font-bold">The Class</h2>
                <div className="flex flex-col gap-4 max-w-3xl">
                  <p className="text-[#92c0c9] text-base leading-relaxed">
                    Last year in my Wellbeing course at REAL School Budapest, students studied how their minds and bodies actually work. We explored how social media is designed to hijack attention — the dopamine spikes and crashes, the infinite scroll, the notification anxiety. We learned the basics of neuroplasticity and how repeated behaviours reshape the brain over time.
                  </p>
                  <p className="text-white text-base leading-relaxed font-medium">
                    Then we tried to do something about it.
                  </p>
                  <p className="text-[#92c0c9] text-base leading-relaxed">
                    Students moved from SMART goals to smart habit design — creating specific plans to take charge of their own wellbeing. Sleep, movement, focus, connection. I did it alongside them. I hit my own goal that year: deadlifting 90kg.
                  </p>
                </div>
              </section>

              {/* Section 2: The Problem */}
              <section className="flex flex-col gap-6">
                <h2 className="text-[#13c8ec] text-xl font-bold">The Problem</h2>
                <div className="flex flex-col gap-4 max-w-3xl">
                  <p className="text-white text-base leading-relaxed font-medium">
                    The habit design worked. The tracking didn&apos;t.
                  </p>
                  <p className="text-[#92c0c9] text-base leading-relaxed">
                    I had 20 students, each with their own Google Sheet. It was a mess. Manually checking progress was tedious. Calculating streaks was error-prone. Worst of all, students couldn&apos;t see each other&apos;s journeys — and that visibility is where the real motivation lives. When you know others are struggling and showing up too, it changes things. When an educator tracks habits alongside their students, it stops being an assignment. It becomes something we&apos;re all doing together.
                  </p>
                  <p className="text-[#92c0c9] text-base leading-relaxed">
                    The tools that existed didn&apos;t fit. Consumer habit apps were designed for individuals, not classrooms. School wellness platforms focused on surveys and compliance, not student agency. Nothing combined the science of behaviour change with the power of doing it in community.
                  </p>
                  <p className="text-white text-base leading-relaxed font-medium">
                    So I decided to build it.
                  </p>
                </div>
              </section>

              {/* Section 3: The Build */}
              <section className="flex flex-col gap-6">
                <h2 className="text-[#13c8ec] text-xl font-bold">The Build</h2>
                <div className="flex flex-col gap-4 max-w-3xl">
                  <p className="text-[#92c0c9] text-base leading-relaxed">
                    I&apos;m not an app developer. I use AI tools to help me code, and I figure things out as I go. Strive is built to meet a real need I couldn&apos;t solve any other way.
                  </p>
                  <p className="text-[#92c0c9] text-base leading-relaxed">
                    What matters most to me is the connection — the conversations that happen because we can see how each other is doing. That&apos;s where the magic is. Students noticing a classmate&apos;s streak. Checking in when someone falls off. An educator sharing that they missed a day too. This builds belonging and psychological safety. That&apos;s not a feature. That&apos;s the whole point.
                  </p>
                </div>
              </section>

              {/* Section 4: The Vision */}
              <section className="flex flex-col gap-6">
                <h2 className="text-[#13c8ec] text-xl font-bold">The Vision</h2>
                <div className="flex flex-col gap-4 max-w-3xl">
                  <p className="text-white text-base leading-relaxed font-medium">
                    My vision is to build communities where we strive together to become our best selves.
                  </p>
                  <p className="text-[#92c0c9] text-base leading-relaxed">
                    Habits are a form of self-care — small ways of investing in your future self. Technology should help people need it less over time. The goal isn&apos;t to keep students in the app. It&apos;s to help them become the kind of person who doesn&apos;t need it.
                  </p>
                  <p className="text-[#92c0c9] text-base leading-relaxed">
                    That&apos;s what I&apos;m trying to build.
                  </p>
                </div>
              </section>

              {/* Sign-off */}
              <section className="flex flex-col gap-2 max-w-3xl">
                <p className="text-[#92c0c9]/80 text-sm italic">
                  — Gareth Manning
                </p>
                <p className="text-[#92c0c9]/60 text-sm italic">
                  Educator & Founder
                </p>
              </section>

              {/* CTA */}
              <section className="flex flex-col items-center gap-6 px-4 py-10 bg-[#192f33]/50 rounded-2xl">
                <h2 className="text-white text-2xl md:text-3xl font-bold text-center">
                  Want to try Strive with your class?
                </h2>
                <Link
                  href="/login"
                  className="flex items-center justify-center rounded-lg h-12 px-8 bg-[#13c8ec] text-[#101f22] text-base font-bold tracking-wide hover:bg-[#0ea5c7] transition-colors"
                >
                  Get Started for Free
                </Link>
              </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/10 mt-10">
              <div className="flex flex-col gap-6 py-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-[#92c0c9] text-sm">© 2026 Strive. All rights reserved.</p>
                  <div className="flex items-center gap-6">
                    <Link href="/" className="text-[#92c0c9] hover:text-white text-sm transition-colors">
                      Home
                    </Link>
                    <Link href="/philosophy" className="text-[#92c0c9] hover:text-white text-sm transition-colors">
                      Philosophy
                    </Link>
                    <Link href="/safety" className="text-[#92c0c9] hover:text-white text-sm transition-colors">
                      Safety
                    </Link>
                  </div>
                </div>
                <p className="text-[#92c0c9]/60 text-xs text-center">
                  Strive is in early beta. We&apos;re piloting with real students and learning as we go.
                </p>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
