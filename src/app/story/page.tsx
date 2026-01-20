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
                    In my Wellbeing course at REAL School Budapest, students study how their minds and bodies actually work. We explore how social media is designed to hijack attention — the dopamine spikes and crashes, the infinite scroll, the notification anxiety. We learn the basics of neuroplasticity and how repeated behaviors literally reshape the brain.
                  </p>
                  <p className="text-white text-base leading-relaxed font-medium">
                    Then we turn that knowledge into action.
                  </p>
                  <p className="text-[#92c0c9] text-base leading-relaxed">
                    Students move from SMART goals to smart habit design — creating specific, science-backed plans to take charge of their own wellbeing. Sleep, movement, focus, connection. I do it alongside them. (Last year I hit my goal of deadlifting 90kg.)
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
                    I had 20 students, each with their own Google Sheet. Manually checking progress was tedious. Calculating streaks was error-prone. Worst of all, students couldn&apos;t see each other&apos;s journeys — they missed the motivation that comes from knowing you&apos;re not alone.
                  </p>
                  <p className="text-[#92c0c9] text-base leading-relaxed">
                    The tools that existed didn&apos;t fit. Consumer habit apps were designed for individuals, not classrooms. School wellness platforms focused on surveys and compliance, not student agency. Nothing combined the science of behavior change with the power of social accountability.
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
                    I&apos;m not a software engineer. I&apos;ve spent 20 years designing learning systems across 27 countries — and now I build with AI. Strive is what happens when curriculum design meets vibe coding.
                  </p>
                  <p className="text-[#92c0c9] text-base leading-relaxed">
                    I describe what I want, AI helps write the code, and I learn as I go. This means Strive is evolving. It&apos;s not a polished product from a big tech company. It&apos;s a work in progress, shaped by real student feedback, getting better every week. Some things are rough around the edges. But it&apos;s built with intention, grounded in research, and close to the classroom.
                  </p>
                </div>
              </section>

              {/* Section 4: The Vision */}
              <section className="flex flex-col gap-6">
                <h2 className="text-[#13c8ec] text-xl font-bold">The Vision</h2>
                <div className="flex flex-col gap-4 max-w-3xl">
                  <p className="text-[#92c0c9] text-base leading-relaxed">
                    I believe habits are self-care. Every small action is a vote for the person you want to become.
                  </p>
                  <p className="text-[#92c0c9] text-base leading-relaxed">
                    I believe students should design their own habits, not have them assigned. Agency matters.
                  </p>
                  <p className="text-[#92c0c9] text-base leading-relaxed">
                    I believe technology should help you need it less, not more. The goal isn&apos;t engagement — it&apos;s transformation.
                  </p>
                  <p className="text-white text-base leading-relaxed font-medium">
                    Strive is my attempt to put these beliefs into practice.
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
