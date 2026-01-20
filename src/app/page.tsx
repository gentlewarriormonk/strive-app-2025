'use client';

import Link from 'next/link';
import Image from 'next/image';
import { PublicHeader } from '@/components/layout/PublicHeader';

export default function LandingPage() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      className="relative flex min-h-screen w-full flex-col overflow-x-hidden"
      style={{
        backgroundImage: 'radial-gradient(circle at top, #101f22, #0d191b, #010409)',
      }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-4 sm:px-8 md:px-20 lg:px-40 py-5">
          <div className="flex w-full max-w-[1100px] flex-1 flex-col">
            <PublicHeader />

            <main className="flex flex-col gap-20 md:gap-32 py-16 md:py-24">
              {/* SECTION 1: Hero */}
              <section className="flex flex-col gap-12 px-4 lg:flex-row lg:items-center">
                <div className="flex flex-col gap-6 text-left lg:w-1/2 lg:gap-8">
                  <div className="flex flex-col gap-4">
                    <h1 className="text-white text-4xl font-black leading-tight tracking-tight md:text-5xl">
                      Become who you want to be — one habit at a time.
                    </h1>
                    <p className="text-[#92c0c9] text-base md:text-lg font-normal leading-relaxed">
                      Strive helps you design habits that stick, using behavioral science — not tricks to keep you hooked.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-start">
                    <Link
                      href="/login"
                      className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-[#13c8ec] text-[#101f22] text-base font-bold tracking-wide hover:bg-[#0ea5c7] transition-colors"
                    >
                      Get Started Free
                    </Link>
                    <button
                      onClick={() => scrollToSection('how-it-works')}
                      className="text-[#13c8ec] hover:text-[#0ea5c7] text-base font-medium transition-colors h-12 px-2 flex items-center gap-1"
                    >
                      See How It Works
                      <span className="material-symbols-outlined !text-lg">arrow_downward</span>
                    </button>
                  </div>
                </div>
                <div className="w-full lg:w-1/2 flex items-center justify-center">
                  <Image
                    src="/striveapp-logo.png"
                    alt="Strive app logo"
                    width={320}
                    height={320}
                    className="w-64 h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 object-contain"
                    priority
                  />
                </div>
              </section>

              {/* SECTION 2: The Strive Difference (Manifesto) */}
              <section className="flex flex-col gap-8 px-4 py-8 md:py-12">
                <h2 className="text-white text-3xl md:text-4xl font-bold text-center">
                  Motivation Without Manipulation
                </h2>
                <div className="max-w-3xl mx-auto">
                  <p className="text-[#92c0c9] text-lg md:text-xl leading-relaxed text-center">
                    Most habit apps use streaks to create guilt and notifications to keep you hooked. Strive is different. We help you build agency and self-efficacy — not app dependency. The goal is to help you become someone who doesn&apos;t need us anymore.
                  </p>
                </div>
              </section>

              {/* SECTION 3: How It Works (3 cards) */}
              <section id="how-it-works" className="flex flex-col gap-10 scroll-mt-8 px-4">
                <h2 className="text-white text-2xl md:text-3xl font-bold text-center">
                  How Strive Works
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                  <div className="flex flex-col gap-4 rounded-xl bg-[#192f33] border border-white/10 p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#13c8ec] text-[#101f22] font-bold text-lg">
                      1
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-white text-lg font-bold">Design with intention</h3>
                      <p className="text-[#92c0c9] text-sm leading-relaxed">
                        Create a specific plan using if-then planning: &quot;After I [trigger], I will [habit]. If [obstacle], I will [backup].&quot; Our AI helps you get specific.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 rounded-xl bg-[#192f33] border border-white/10 p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#13c8ec] text-[#101f22] font-bold text-lg">
                      2
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-white text-lg font-bold">Track what matters</h3>
                      <p className="text-[#92c0c9] text-sm leading-relaxed">
                        Log completions, see your streaks, earn XP. Miss a day? No guilt. Never miss twice is the real goal.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 rounded-xl bg-[#192f33] border border-white/10 p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#13c8ec] text-[#101f22] font-bold text-lg">
                      3
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-white text-lg font-bold">Grow together</h3>
                      <p className="text-[#92c0c9] text-sm leading-relaxed">
                        Join a class, team, or go solo. Share what you want, with whom you want. Your privacy, your control.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 4: Built for Classrooms */}
              <section className="flex flex-col gap-10 px-4 py-8 bg-[#0d191b]/50 -mx-4 sm:-mx-8 md:-mx-20 lg:-mx-40">
                <div className="max-w-[1100px] mx-auto px-4 sm:px-8 md:px-20 lg:px-40 w-full">
                  <div className="flex flex-col gap-3 text-center mb-8">
                    <h2 className="text-white text-2xl md:text-3xl font-bold">
                      Built for classrooms
                    </h2>
                    <p className="text-[#92c0c9] text-base md:text-lg">
                      Teachers get the visibility they need. Students keep the privacy they want.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
                    <div className="flex flex-col gap-3 rounded-xl bg-[#192f33] border border-white/10 p-5">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#13c8ec] text-2xl">visibility</span>
                        <h3 className="text-white text-base font-bold">See progress at a glance</h3>
                      </div>
                      <p className="text-[#92c0c9] text-sm leading-relaxed">
                        View your whole class&apos;s streaks, completions, and engagement in one dashboard.
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 rounded-xl bg-[#192f33] border border-white/10 p-5">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#13c8ec] text-2xl">lock</span>
                        <h3 className="text-white text-base font-bold">Privacy by design</h3>
                      </div>
                      <p className="text-[#92c0c9] text-sm leading-relaxed">
                        Students control what classmates see. Teachers always have full visibility for support.
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 rounded-xl bg-[#192f33] border border-white/10 p-5">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#13c8ec] text-2xl">group</span>
                        <h3 className="text-white text-base font-bold">Model the behavior</h3>
                      </div>
                      <p className="text-[#92c0c9] text-sm leading-relaxed">
                        Share your own habits with your class. Show students you&apos;re on the journey too.
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 rounded-xl bg-[#192f33] border border-white/10 p-5">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#13c8ec] text-2xl">bolt</span>
                        <h3 className="text-white text-base font-bold">Zero prep required</h3>
                      </div>
                      <p className="text-[#92c0c9] text-sm leading-relaxed">
                        Students join with a code. No accounts to create, no rosters to upload.
                      </p>
                    </div>
                  </div>
                  {/* TODO: Add teacher dashboard screenshot here */}
                  <div className="mt-8 max-w-4xl mx-auto">
                    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 p-8">
                      <span className="material-symbols-outlined text-[#92c0c9]/40 text-4xl mb-2">dashboard</span>
                      <p className="text-[#92c0c9]/60 text-sm text-center">
                        Teacher dashboard preview coming soon
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 5: What We Believe (3 beliefs) */}
              <section className="flex flex-col gap-10 px-4">
                <h2 className="text-white text-2xl md:text-3xl font-bold text-center">
                  What We Believe
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                  <div className="flex flex-col gap-3 rounded-xl bg-[#192f33] border border-white/10 p-6">
                    <h3 className="text-[#13c8ec] text-lg font-bold">Habits are self-care</h3>
                    <p className="text-[#92c0c9] text-sm leading-relaxed">
                      Every habit is an investment in your future self.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 rounded-xl bg-[#192f33] border border-white/10 p-6">
                    <h3 className="text-[#13c8ec] text-lg font-bold">Never miss twice</h3>
                    <p className="text-[#92c0c9] text-sm leading-relaxed">
                      Perfection isn&apos;t the goal. Getting back on track is the skill.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 rounded-xl bg-[#192f33] border border-white/10 p-6">
                    <h3 className="text-[#13c8ec] text-lg font-bold">The app is a tool, not a crutch</h3>
                    <p className="text-[#92c0c9] text-sm leading-relaxed">
                      We succeed when you don&apos;t need us anymore.
                    </p>
                  </div>
                </div>
                <div className="text-center">
                  <Link
                    href="/philosophy"
                    className="text-[#13c8ec] hover:text-[#0ea5c7] text-base font-medium transition-colors inline-flex items-center gap-1"
                  >
                    Read our full philosophy
                    <span className="material-symbols-outlined !text-lg">arrow_forward</span>
                  </Link>
                </div>
              </section>

              {/* SECTION 6: Final CTA */}
              <section className="flex flex-col items-center gap-6 px-4 py-12 bg-[#192f33]/50 rounded-2xl mx-4">
                <h2 className="text-white text-2xl md:text-3xl font-bold text-center">
                  Ready to build better habits?
                </h2>
                <p className="text-[#92c0c9] text-center max-w-xl">
                  Free for individuals and teachers. No credit card required.
                </p>
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
                    <Link
                      href="/story"
                      className="text-[#92c0c9] hover:text-white text-sm transition-colors"
                    >
                      Story
                    </Link>
                    <Link
                      href="/philosophy"
                      className="text-[#92c0c9] hover:text-white text-sm transition-colors"
                    >
                      Philosophy
                    </Link>
                    <Link
                      href="/safety"
                      className="text-[#92c0c9] hover:text-white text-sm transition-colors"
                    >
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
