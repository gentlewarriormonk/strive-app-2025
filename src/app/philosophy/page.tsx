import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';

export default function PhilosophyPage() {
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

            <main className="flex flex-col gap-16 py-16">
              {/* Hero */}
              <section className="flex flex-col gap-6 text-center">
                <h1 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-tight">
                  Take Control of Your Wellbeing
                </h1>
                <p className="text-[#92c0c9] text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
                  Strive is built for high-agency people — those who want to take ownership of their habits, their growth, and their lives. We believe in giving you the tools, not doing the work for you.
                </p>
              </section>

              {/* What We Believe */}
              <section className="flex flex-col gap-10">
                <h2 className="text-white text-2xl md:text-3xl font-bold text-center">
                  What We Believe
                </h2>

                {/* Belief 1 */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-[#13c8ec] text-xl font-bold">Habits are self-care</h3>
                  <div className="text-[#92c0c9] text-base leading-relaxed space-y-4">
                    <p>
                      Every habit you build is an investment in your future self. When you commit to moving your body, getting enough sleep, or practicing mindfulness, you&apos;re not just checking boxes — you&apos;re building the foundation for a healthier, more resilient you.
                    </p>
                    <p>
                      We don&apos;t view habits as chores or obligations. They&apos;re acts of self-respect. The discipline to show up for yourself, day after day, is one of the most powerful forms of self-care there is.
                    </p>
                  </div>
                </div>

                {/* Belief 2 */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-[#13c8ec] text-xl font-bold">Tracking isn&apos;t enough</h3>
                  <div className="text-[#92c0c9] text-base leading-relaxed space-y-4">
                    <p>
                      Most habit apps are glorified checklists. You track, you fail, you feel bad, you delete the app. Sound familiar? That&apos;s because tracking alone doesn&apos;t change behavior.
                    </p>
                    <p>
                      Strive is different. We help you design habits using proven behavior change science — implementation intentions, cue-routine-reward loops, and identity-based habits. We don&apos;t just count the habits that don&apos;t stick; we help you build ones that do.
                    </p>
                    <p>
                      The goal isn&apos;t a perfect streak. It&apos;s sustainable change.
                    </p>
                  </div>
                </div>

                {/* Belief 3 */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-[#13c8ec] text-xl font-bold">Identity outlasts motivation</h3>
                  <div className="text-[#92c0c9] text-base leading-relaxed space-y-4">
                    <p>
                      &quot;I want to run more&quot; is a goal. &quot;I am a runner&quot; is an identity. The difference matters more than you might think.
                    </p>
                    <p>
                      Motivation is unreliable — it comes and goes with your mood, your energy, your circumstances. But when a behavior becomes part of who you are, you don&apos;t need motivation to do it. You just do it because that&apos;s who you are.
                    </p>
                    <p>
                      Strive helps you build identity through small, consistent actions. Every time you check off a habit, you&apos;re casting a vote for the person you want to become.
                    </p>
                  </div>
                </div>

                {/* Belief 4 */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-[#13c8ec] text-xl font-bold">Social connection, not surveillance</h3>
                  <div className="text-[#92c0c9] text-base leading-relaxed space-y-4">
                    <p>
                      Humans are social creatures. We do better when we&apos;re connected to others who share our goals. But there&apos;s a fine line between supportive accountability and invasive surveillance.
                    </p>
                    <p>
                      In Strive, you control what others see. Keep habits completely private, share progress with your group, or make achievements public. Your wellbeing journey is yours to share — or not — on your terms.
                    </p>
                    <p>
                      We believe in the power of community without the pressure of constant visibility.
                    </p>
                  </div>
                </div>

                {/* Belief 5 */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-[#13c8ec] text-xl font-bold">Never miss twice</h3>
                  <div className="text-[#92c0c9] text-base leading-relaxed space-y-4">
                    <p>
                      Perfection is the enemy of progress. You will miss days. You will break streaks. You will fall off the wagon. This isn&apos;t failure — it&apos;s being human.
                    </p>
                    <p>
                      The skill that matters isn&apos;t never missing. It&apos;s getting back on track quickly. Miss once? No problem. Miss twice? That&apos;s when a miss becomes a pattern.
                    </p>
                    <p>
                      Strive celebrates recovery, not just consistency. Getting back on track after a slip is a victory worth recognizing.
                    </p>
                  </div>
                </div>

                {/* Belief 6 */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-[#13c8ec] text-xl font-bold">The app is a tool, not a crutch</h3>
                  <div className="text-[#92c0c9] text-base leading-relaxed space-y-4">
                    <p>
                      We succeed when you don&apos;t need us anymore. That might sound like a strange thing for an app to say, but it&apos;s true.
                    </p>
                    <p>
                      The ultimate goal of Strive is to help you build habits so deeply that they become automatic — part of who you are, not something you need an app to remind you to do. We want to be training wheels, not a permanent fixture.
                    </p>
                    <p>
                      Use Strive as long as it helps. Leave when you&apos;ve outgrown it. That&apos;s success.
                    </p>
                  </div>
                </div>
              </section>

              {/* What We Won't Do */}
              <section className="flex flex-col gap-6">
                <h2 className="text-white text-2xl md:text-3xl font-bold text-center">
                  What We Won&apos;t Do
                </h2>
                <div className="bg-[#192f33] border border-white/10 rounded-xl p-6 md:p-8">
                  <ul className="space-y-4 text-[#92c0c9] text-base leading-relaxed">
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-red-400 text-xl mt-0.5">close</span>
                      <span><strong className="text-white">No dark patterns.</strong> We won&apos;t use manipulative design to keep you scrolling, clicking, or opening the app more than you need to.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-red-400 text-xl mt-0.5">close</span>
                      <span><strong className="text-white">No shame.</strong> We won&apos;t make you feel bad for missing a day, breaking a streak, or being imperfect. Life happens.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-red-400 text-xl mt-0.5">close</span>
                      <span><strong className="text-white">No anxiety notifications.</strong> We won&apos;t send you guilt-tripping push notifications designed to create FOMO or stress.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-red-400 text-xl mt-0.5">close</span>
                      <span><strong className="text-white">No data exploitation.</strong> Your habit data is yours. We won&apos;t sell it, mine it for ads, or use it against you.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-red-400 text-xl mt-0.5">close</span>
                      <span><strong className="text-white">No false promises.</strong> Building habits is hard. We won&apos;t pretend our app is magic. We&apos;re a tool that helps — but you do the work.</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Who Strive Is For */}
              <section className="flex flex-col gap-6">
                <h2 className="text-white text-2xl md:text-3xl font-bold text-center">
                  Who Strive Is For
                </h2>
                <div className="max-w-3xl mx-auto text-center">
                  <p className="text-[#92c0c9] text-base md:text-lg leading-relaxed">
                    Strive is for high-agency people who want to take control of their wellbeing — not wait for someone else to fix it for them.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#192f33] border border-white/10 rounded-xl p-6 text-center">
                    <span className="material-symbols-outlined text-[#13c8ec] text-3xl mb-3">person</span>
                    <h3 className="text-white text-lg font-bold mb-2">Individuals</h3>
                    <p className="text-[#92c0c9] text-sm leading-relaxed">
                      Anyone looking to build better habits — whether it&apos;s sleep, exercise, mindfulness, or any personal goal.
                    </p>
                  </div>
                  <div className="bg-[#192f33] border border-white/10 rounded-xl p-6 text-center">
                    <span className="material-symbols-outlined text-[#13c8ec] text-3xl mb-3">groups</span>
                    <h3 className="text-white text-lg font-bold mb-2">Groups & Teams</h3>
                    <p className="text-[#92c0c9] text-sm leading-relaxed">
                      Sports teams, clubs, friend groups, or any community that wants to grow together with shared accountability.
                    </p>
                  </div>
                  <div className="bg-[#192f33] border border-white/10 rounded-xl p-6 text-center">
                    <span className="material-symbols-outlined text-[#13c8ec] text-3xl mb-3">school</span>
                    <h3 className="text-white text-lg font-bold mb-2">Schools</h3>
                    <p className="text-[#92c0c9] text-sm leading-relaxed">
                      Teachers and schools looking to support student wellbeing with the right balance of accountability and privacy.
                    </p>
                  </div>
                </div>
              </section>

              {/* Origin Story */}
              <section className="flex flex-col gap-6">
                <h2 className="text-white text-2xl md:text-3xl font-bold text-center">
                  Where Strive Came From
                </h2>
                <div className="bg-[#192f33] border border-white/10 rounded-xl p-6 md:p-8">
                  <div className="text-[#92c0c9] text-base leading-relaxed space-y-4">
                    <p>
                      Strive started in a Wellbeing class at REAL School Budapest. Students learned about habit formation — cue-routine-reward loops, implementation intentions, identity-based habits. They set goals and tracked progress using individual Google Sheets.
                    </p>
                    <p>
                      The approach worked. Students engaged deeply, and many built lasting habits. But managing 20+ spreadsheets was painful. There was no social visibility, no data insights, and no way to see patterns across the class.
                    </p>
                    <p>
                      Strive was built to solve these problems — a purpose-built tool for habit formation with the right balance of accountability, privacy, and community support.
                    </p>
                  </div>
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <p className="text-white text-base leading-relaxed italic">
                      &quot;Strive is the app I wished existed — purpose-built for schools, with the right balance of accountability and privacy.&quot;
                    </p>
                    <p className="text-[#13c8ec] text-sm font-medium mt-2">
                      — Gareth Manning, Teacher & Creator
                    </p>
                  </div>
                </div>
              </section>

              {/* CTA */}
              <section className="flex flex-col items-center gap-6 px-4 py-12 bg-[#192f33]/50 rounded-2xl">
                <h2 className="text-white text-2xl md:text-3xl font-bold text-center">
                  Ready to take control?
                </h2>
                <p className="text-[#92c0c9] text-center max-w-xl">
                  Join thousands of high-agency people using Strive to build lasting habits.
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
                  <Link href="/" className="text-[#92c0c9] hover:text-white text-sm transition-colors">
                    Home
                  </Link>
                  <Link href="/philosophy" className="text-[#92c0c9] hover:text-white text-sm transition-colors">
                    Philosophy
                  </Link>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
