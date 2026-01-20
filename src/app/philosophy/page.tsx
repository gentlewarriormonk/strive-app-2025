'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';

export default function PhilosophyPage() {
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
              <section className="flex flex-col gap-6">
                <h1 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-tight">
                  What We Believe
                </h1>
                <p className="text-[#92c0c9] text-lg leading-relaxed max-w-3xl">
                  Strive isn&apos;t just a habit tracker. It&apos;s built on a set of beliefs about behavior change, technology, and what it means to help someone grow. Here&apos;s what guides us.
                </p>
              </section>

              {/* Beliefs */}
              <section className="flex flex-col gap-10">
                {/* Belief 1 */}
                <div className="flex flex-col gap-3 max-w-3xl">
                  <h2 className="text-[#13c8ec] text-xl font-bold">Habits are self-care</h2>
                  <p className="text-[#92c0c9] text-base leading-relaxed">
                    Every habit is an investment in your future self. We don&apos;t frame habits as productivity hacks or optimization. We frame them as acts of self-respect — small ways of saying &quot;I matter.&quot;
                  </p>
                </div>

                {/* Belief 2 */}
                <div className="flex flex-col gap-3 max-w-3xl">
                  <h2 className="text-[#13c8ec] text-xl font-bold">Tracking isn&apos;t enough</h2>
                  <p className="text-[#92c0c9] text-base leading-relaxed">
                    Most apps stop at recording. But writing down what you did doesn&apos;t change who you become. Strive helps you design habits using implementation intentions — specific plans for when, where, and how you&apos;ll act. Research shows this approach doubles your odds of follow-through.
                  </p>
                </div>

                {/* Belief 3 */}
                <div className="flex flex-col gap-3 max-w-3xl">
                  <h2 className="text-[#13c8ec] text-xl font-bold">Identity outlasts motivation</h2>
                  <p className="text-[#92c0c9] text-base leading-relaxed">
                    &quot;I want to exercise more&quot; fades. &quot;I&apos;m someone who moves their body&quot; lasts. We help students see their habits as evidence of who they&apos;re becoming, not just boxes to check.
                  </p>
                </div>

                {/* Belief 4 */}
                <div className="flex flex-col gap-3 max-w-3xl">
                  <h2 className="text-[#13c8ec] text-xl font-bold">Never miss twice</h2>
                  <p className="text-[#92c0c9] text-base leading-relaxed">
                    Perfection isn&apos;t the goal. Recovery is the skill. Everyone misses a day — what matters is what you do next. We don&apos;t punish missed streaks with guilt. We celebrate getting back on track.
                  </p>
                </div>

                {/* Belief 5 */}
                <div className="flex flex-col gap-3 max-w-3xl">
                  <h2 className="text-[#13c8ec] text-xl font-bold">Social connection, not surveillance</h2>
                  <p className="text-[#92c0c9] text-base leading-relaxed">
                    Humans change better together. But accountability should be chosen, not imposed. Students control what classmates see. Teachers have visibility for support, not monitoring. Share what you want, with whom you want.
                  </p>
                </div>

                {/* Belief 6 */}
                <div className="flex flex-col gap-3 max-w-3xl">
                  <h2 className="text-[#13c8ec] text-xl font-bold">The app is a tool, not a crutch</h2>
                  <p className="text-[#92c0c9] text-base leading-relaxed">
                    We succeed when you don&apos;t need us anymore. Our job is to help you build habits that become automatic — part of who you are, not something you have to track forever.
                  </p>
                </div>
              </section>

              {/* CTA */}
              <section className="flex flex-col items-center gap-6 px-4 py-10 bg-[#192f33]/50 rounded-2xl">
                <h2 className="text-white text-2xl md:text-3xl font-bold text-center">
                  Ready to build better habits?
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
                    <Link href="/story" className="text-[#92c0c9] hover:text-white text-sm transition-colors">
                      Story
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
