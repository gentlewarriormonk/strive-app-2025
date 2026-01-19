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

            <main className="flex flex-col gap-16 md:gap-24 py-16 md:py-24">
              {/* Hero Section */}
              <section className="flex flex-col gap-12 px-4 lg:flex-row lg:items-center">
                <div className="flex flex-col gap-6 text-left lg:w-1/2 lg:gap-8">
                  <div className="flex flex-col gap-4">
                    <h1 className="text-white text-4xl font-black leading-tight tracking-tight md:text-5xl">
                      Own your habits. Own your wellbeing.
                    </h1>
                    <p className="text-[#92c0c9] text-base md:text-lg font-normal leading-relaxed">
                      Design habits that stick. Track what matters. Grow together.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                    <Link
                      href="/login"
                      className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-[#13c8ec] text-[#101f22] text-base font-bold tracking-wide hover:bg-[#0ea5c7] transition-colors"
                    >
                      Sign in with Google
                    </Link>
                    <button
                      onClick={() => scrollToSection('how-it-works')}
                      className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-white/10 text-white text-base font-bold tracking-wide hover:bg-white/20 transition-colors"
                    >
                      See how it works
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

              {/* The Problem Section */}
              <section className="flex flex-col gap-6 px-4">
                <h2 className="text-white text-2xl md:text-3xl font-bold text-center">
                  Habits are hard. Strive makes them easier.
                </h2>
                <div className="max-w-3xl mx-auto text-center">
                  <p className="text-[#92c0c9] text-base md:text-lg leading-relaxed">
                    Design habits that fit your life. Track progress without pressure. See your growth over time.
                  </p>
                </div>
              </section>

              {/* The Science Section */}
              <section className="flex flex-col gap-8 px-4">
                <h2 className="text-white text-2xl md:text-3xl font-bold text-center">
                  Smart Habits, Not Just Smart Goals
                </h2>
                <p className="text-[#92c0c9] text-base text-center max-w-2xl mx-auto">
                  Strive is built on proven behavior change principles:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                  <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#192f33] p-6">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#13c8ec] text-2xl">target</span>
                      <h3 className="text-white text-lg font-bold">Implementation Intentions</h3>
                    </div>
                    <p className="text-[#92c0c9] text-sm leading-relaxed">
                      Not just &quot;I want to exercise&quot; but &quot;I will run for 20 minutes every Monday, Wednesday, Friday after school&quot;
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#192f33] p-6">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#13c8ec] text-2xl">sync</span>
                      <h3 className="text-white text-lg font-bold">Cue-Routine-Reward</h3>
                    </div>
                    <p className="text-[#92c0c9] text-sm leading-relaxed">
                      Design habits that stick by connecting them to existing behaviors
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#192f33] p-6">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#13c8ec] text-2xl">groups</span>
                      <h3 className="text-white text-lg font-bold">Social Accountability</h3>
                    </div>
                    <p className="text-[#92c0c9] text-sm leading-relaxed">
                      See your group&apos;s progress, celebrate streaks, support each other
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#192f33] p-6">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#13c8ec] text-2xl">trending_up</span>
                      <h3 className="text-white text-lg font-bold">Visual Progress</h3>
                    </div>
                    <p className="text-[#92c0c9] text-sm leading-relaxed">
                      Streaks, XP, and heatmaps make consistency visible and motivating
                    </p>
                  </div>
                </div>
              </section>

              {/* Features Section - For Individuals/Groups/Schools */}
              <section className="flex flex-col gap-6 scroll-mt-24">
                <h2 className="text-white text-2xl font-bold text-center">
                  Built for individuals, teams, and schools
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                  <div id="individuals" className="flex flex-1 flex-col gap-4 rounded-xl border border-white/10 bg-[#192f33] p-6 hover:border-[#13c8ec]/30 transition-colors scroll-mt-24">
                    <div className="text-[#13c8ec]">
                      <span className="material-symbols-outlined text-3xl">person</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-white text-lg font-bold">For Individuals</h3>
                      <p className="text-[#92c0c9] text-sm leading-relaxed">
                        Track personal habits with streaks, stats, and motivation — whether you&apos;re part of a group or going solo.
                      </p>
                    </div>
                  </div>
                  <div id="groups" className="flex flex-1 flex-col gap-4 rounded-xl border border-white/10 bg-[#192f33] p-6 hover:border-[#13c8ec]/30 transition-colors scroll-mt-24">
                    <div className="text-[#13c8ec]">
                      <span className="material-symbols-outlined text-3xl">groups</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-white text-lg font-bold">For Groups & Teams</h3>
                      <p className="text-[#92c0c9] text-sm leading-relaxed">
                        Classes, sports teams, clubs, or any community — create a group, share progress, and grow together.
                      </p>
                    </div>
                  </div>
                  <div id="schools" className="flex flex-1 flex-col gap-4 rounded-xl border border-white/10 bg-[#192f33] p-6 hover:border-[#13c8ec]/30 transition-colors scroll-mt-24">
                    <div className="text-[#13c8ec]">
                      <span className="material-symbols-outlined text-3xl">school</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-white text-lg font-bold">For Schools</h3>
                      <p className="text-[#92c0c9] text-sm leading-relaxed">
                        Support student wellbeing with teacher dashboards, privacy controls, and school-wide insights.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Privacy Callout */}
              <section className="flex flex-col gap-4 px-4">
                <div className="max-w-3xl mx-auto text-center rounded-xl bg-[#13c8ec]/10 border border-[#13c8ec]/30 p-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-[#13c8ec] text-2xl">lock</span>
                    <h3 className="text-white text-lg font-bold">Your Privacy, Your Control</h3>
                  </div>
                  <p className="text-[#92c0c9] text-base leading-relaxed">
                    You control what others see. Keep habits private, share with your group, or go public.
                  </p>
                </div>
              </section>

              {/* How It Works Section */}
              <section id="how-it-works" className="flex flex-col gap-8 scroll-mt-8">
                <h2 className="text-white text-2xl font-bold text-center">
                  How it works in 3 simple steps
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
                  <div className="flex flex-col gap-4 items-start rounded-xl bg-[#192f33] border border-white/10 p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#13c8ec] text-[#101f22] font-bold text-lg">
                      1
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-white text-lg font-bold">Set Goals</h3>
                      <p className="text-[#92c0c9] text-sm leading-relaxed">
                        Create your own habits or join a group to build them together.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 items-start rounded-xl bg-[#192f33] border border-white/10 p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#13c8ec] text-[#101f22] font-bold text-lg">
                      2
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-white text-lg font-bold">Track Progress</h3>
                      <p className="text-[#92c0c9] text-sm leading-relaxed">
                        Check in daily, build streaks, and see your progress over time.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 items-start rounded-xl bg-[#192f33] border border-white/10 p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#13c8ec] text-[#101f22] font-bold text-lg">
                      3
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-white text-lg font-bold">Celebrate Growth</h3>
                      <p className="text-[#92c0c9] text-sm leading-relaxed">
                        Earn XP, level up, and support others on their journey.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* See Strive in Action Section - Placeholder */}
              <section className="flex flex-col gap-6 px-4">
                <div className="text-center">
                  <h2 className="text-white text-2xl font-bold">
                    See Strive in action
                  </h2>
                  <p className="text-[#92c0c9] text-base mt-2">
                    Preview the student and teacher dashboards before you sign in.
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center rounded-xl bg-[#192f33] border border-white/10 p-12">
                  <span className="material-symbols-outlined text-[#92c0c9] text-5xl mb-4">photo_library</span>
                  <p className="text-[#92c0c9] text-base text-center">
                    Screenshots coming soon
                  </p>
                  <p className="text-[#92c0c9]/60 text-sm text-center mt-2">
                    Sign in to explore the full experience
                  </p>
                </div>
              </section>

              {/* Categories Section */}
              <section className="flex flex-col gap-6 px-4">
                <h2 className="text-white text-2xl font-bold text-center">
                  Build habits across all areas of wellbeing
                </h2>
                <div className="flex flex-wrap justify-center gap-3">
                  {[
                    { icon: 'nights_stay', label: 'Sleep' },
                    { icon: 'directions_run', label: 'Movement' },
                    { icon: 'auto_stories', label: 'Focus & Study' },
                    { icon: 'self_improvement', label: 'Mindfulness' },
                    { icon: 'groups', label: 'Social' },
                    { icon: 'water_drop', label: 'Nutrition' },
                    { icon: 'phone_android', label: 'Digital Hygiene' },
                  ].map((cat) => (
                    <div
                      key={cat.label}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#192f33] border border-white/10"
                    >
                      <span className="material-symbols-outlined text-[#13c8ec] !text-lg">
                        {cat.icon}
                      </span>
                      <span className="text-white text-sm font-medium">{cat.label}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Motivation Without Manipulation Section */}
              <section className="flex flex-col gap-6 px-4">
                <h2 className="text-white text-2xl md:text-3xl font-bold text-center">
                  Motivation Without Manipulation
                </h2>
                <div className="max-w-3xl mx-auto text-center">
                  <p className="text-[#92c0c9] text-base md:text-lg leading-relaxed">
                    Strive uses XP, streaks, and levels — but never notifications designed to create anxiety, dark patterns to keep you scrolling, or social comparison that breeds shame.
                  </p>
                  <p className="text-white text-base md:text-lg leading-relaxed mt-4 font-medium">
                    The goal is building agency and self-efficacy, not app addiction. You learn to own your progress. The app is a tool, not a crutch.
                  </p>
                </div>
              </section>

              {/* Early Stage Disclaimer Section */}
              <section className="flex flex-col gap-6 px-4">
                <h2 className="text-white text-2xl md:text-3xl font-bold text-center">
                  Early Stage & Experimental
                </h2>
                <div className="max-w-3xl mx-auto text-center">
                  <p className="text-[#92c0c9] text-base md:text-lg leading-relaxed">
                    Strive is new. It&apos;s evidence-informed but unproven at scale. We&apos;re piloting with real students and learning as we go.
                  </p>
                  <p className="text-white text-base md:text-lg leading-relaxed mt-4 font-medium">
                    If you&apos;re a teacher interested in trying Strive with your class, we&apos;d love your feedback. It will shape what this becomes.
                  </p>
                </div>
              </section>

              {/* What We Believe Section */}
              <section className="flex flex-col gap-8 px-4">
                <h2 className="text-white text-2xl md:text-3xl font-bold text-center">
                  What We Believe
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[#13c8ec] text-lg font-bold">Habits are self-care</h3>
                    <p className="text-[#92c0c9] text-sm leading-relaxed">
                      Every habit is an investment in your future self.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[#13c8ec] text-lg font-bold">Tracking isn&apos;t enough</h3>
                    <p className="text-[#92c0c9] text-sm leading-relaxed">
                      We help you design habits that stick, not just count the ones that don&apos;t.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[#13c8ec] text-lg font-bold">Identity outlasts motivation</h3>
                    <p className="text-[#92c0c9] text-sm leading-relaxed">
                      &quot;I am someone who...&quot; is more powerful than &quot;I want to...&quot;
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[#13c8ec] text-lg font-bold">Social connection, not surveillance</h3>
                    <p className="text-[#92c0c9] text-sm leading-relaxed">
                      Share what you want, with whom you want.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[#13c8ec] text-lg font-bold">Never miss twice</h3>
                    <p className="text-[#92c0c9] text-sm leading-relaxed">
                      Perfection isn&apos;t the goal. Getting back on track is the skill.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
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

              {/* CTA Section */}
              <section className="flex flex-col items-center gap-6 px-4 py-12 bg-[#192f33]/50 rounded-2xl mx-4">
                <h2 className="text-white text-2xl md:text-3xl font-bold text-center">
                  Ready to build better habits?
                </h2>
                <p className="text-[#92c0c9] text-center max-w-xl">
                  Join thousands of people using Strive to build lasting habits — alone or together.
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
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8">
                <p className="text-[#92c0c9] text-sm">© {new Date().getFullYear()} Strive. All rights reserved.</p>
                <div className="flex items-center gap-6">
                  <a
                    href="#"
                    className="text-[#92c0c9] text-sm cursor-default opacity-60"
                    aria-disabled="true"
                    onClick={(e) => e.preventDefault()}
                  >
                    Privacy Policy
                  </a>
                  <a
                    href="#"
                    className="text-[#92c0c9] text-sm cursor-default opacity-60"
                    aria-disabled="true"
                    onClick={(e) => e.preventDefault()}
                  >
                    Terms of Service
                  </a>
                  <a
                    href="#"
                    className="text-[#92c0c9] text-sm cursor-default opacity-60"
                    aria-disabled="true"
                    onClick={(e) => e.preventDefault()}
                  >
                    Contact Us
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
