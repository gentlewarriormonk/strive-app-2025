'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';

export default function SafetyPage() {
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
                  How We Protect Students
                </h1>
                <p className="text-[#92c0c9] text-lg leading-relaxed max-w-3xl">
                  Strive is designed for classrooms, which means we take student safety seriously. Here&apos;s how we approach data, privacy, and AI — and what we do to earn your trust.
                </p>
              </section>

              {/* Section 1: Privacy by Design */}
              <section className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#13c8ec] text-2xl">shield</span>
                  <h2 className="text-white text-xl font-bold">Privacy by Design</h2>
                </div>
                <div className="flex flex-col gap-4 max-w-3xl pl-9">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-white text-base font-semibold">Students control visibility</h3>
                    <p className="text-[#92c0c9] text-base leading-relaxed">
                      Every habit can be shared with classmates, visible only to the teacher, or completely private. Students decide.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-white text-base font-semibold">Teachers see what they need</h3>
                    <p className="text-[#92c0c9] text-base leading-relaxed">
                      Teachers have full visibility into their own students&apos; habits for pastoral support — but only for students in their groups.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-white text-base font-semibold">No cross-school data sharing</h3>
                    <p className="text-[#92c0c9] text-base leading-relaxed">
                      Your class data stays with your class. We don&apos;t aggregate, sell, or share student information.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 2: Data & GDPR */}
              <section className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#13c8ec] text-2xl">database</span>
                  <h2 className="text-white text-xl font-bold">Data & GDPR</h2>
                </div>
                <div className="flex flex-col gap-4 max-w-3xl pl-9">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-white text-base font-semibold">We collect only what&apos;s necessary</h3>
                    <p className="text-[#92c0c9] text-base leading-relaxed">
                      Name, email (for login), habits, and completions. That&apos;s it.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-white text-base font-semibold">EU compliant</h3>
                    <p className="text-[#92c0c9] text-base leading-relaxed">
                      We follow GDPR requirements for data protection. Students can export or delete their data at any time.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-white text-base font-semibold">No ads, no data sales</h3>
                    <p className="text-[#92c0c9] text-base leading-relaxed">
                      Your students are not the product. We will never sell data or show advertising.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 3: How We Use AI */}
              <section className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#13c8ec] text-2xl">smart_toy</span>
                  <h2 className="text-white text-xl font-bold">How We Use AI</h2>
                </div>
                <div className="flex flex-col gap-6 max-w-3xl pl-9">
                  <p className="text-[#92c0c9] text-base leading-relaxed">
                    Strive uses AI in one place: helping students design better habits during the creation flow.
                  </p>

                  <div className="flex flex-col gap-3">
                    <h3 className="text-white text-base font-semibold">What AI does:</h3>
                    <ul className="text-[#92c0c9] text-base leading-relaxed space-y-2 list-disc list-inside">
                      <li>Suggests more specific versions of habits (&quot;Run&quot; → &quot;Run for 20 minutes&quot;)</li>
                      <li>Helps generate backup plans for obstacles</li>
                      <li>Polishes the final implementation intention for clarity</li>
                    </ul>
                  </div>

                  <div className="flex flex-col gap-3">
                    <h3 className="text-white text-base font-semibold">What AI doesn&apos;t do:</h3>
                    <ul className="text-[#92c0c9] text-base leading-relaxed space-y-2 list-disc list-inside">
                      <li>Receive student names, emails, or any personal information</li>
                      <li>Store or learn from any student data</li>
                      <li>Make decisions about students</li>
                      <li>Access anything beyond the habit text being created in that moment</li>
                    </ul>
                  </div>

                  <p className="text-[#92c0c9] text-base leading-relaxed">
                    We use Claude (by Anthropic) for these suggestions. No personal data ever leaves our servers to reach the AI. Only the anonymous habit description text is sent to generate suggestions.
                  </p>
                </div>
              </section>

              {/* Section 4: No Tricks */}
              <section className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#13c8ec] text-2xl">verified</span>
                  <h2 className="text-white text-xl font-bold">No Tricks</h2>
                </div>
                <div className="flex flex-col gap-4 max-w-3xl pl-9">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-white text-base font-semibold">No guilt mechanics</h3>
                    <p className="text-[#92c0c9] text-base leading-relaxed">
                      We don&apos;t send anxiety-inducing notifications or shame students for missed days.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-white text-base font-semibold">No tricks to keep you hooked</h3>
                    <p className="text-[#92c0c9] text-base leading-relaxed">
                      We don&apos;t use infinite scroll, autoplay, or other techniques designed to maximize screen time.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-white text-base font-semibold">Transparency</h3>
                    <p className="text-[#92c0c9] text-base leading-relaxed">
                      If you have questions about how Strive works, ask. We&apos;ll answer honestly.
                    </p>
                  </div>
                </div>
              </section>

              {/* Contact */}
              <section className="flex flex-col gap-4 max-w-3xl">
                <p className="text-[#92c0c9] text-base leading-relaxed">
                  Questions about safety or privacy? Contact us at{' '}
                  <a href="mailto:hello@striveapp.org" className="text-[#13c8ec] hover:text-[#0ea5c7] transition-colors">
                    hello@striveapp.org
                  </a>
                  {' '}or read our full Privacy Policy.
                </p>
              </section>

              {/* CTA */}
              <section className="flex flex-col items-center gap-6 px-4 py-10 bg-[#192f33]/50 rounded-2xl">
                <h2 className="text-white text-2xl md:text-3xl font-bold text-center">
                  Ready to try Strive with your class?
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
                    <Link href="/philosophy" className="text-[#92c0c9] hover:text-white text-sm transition-colors">
                      Philosophy
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
