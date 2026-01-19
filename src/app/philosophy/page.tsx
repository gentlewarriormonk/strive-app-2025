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

            <main className="flex flex-col gap-12 py-16">
              {/* Hero */}
              <section className="flex flex-col gap-4 text-center">
                <h1 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-tight">
                  Take Control of Your Wellbeing
                </h1>
                <p className="text-[#92c0c9] text-lg leading-relaxed max-w-2xl mx-auto">
                  Strive is built for high-agency people who take ownership of their habits, their growth, and their lives.
                </p>
              </section>

              {/* What We Believe */}
              <section className="flex flex-col gap-8">
                <h2 className="text-white text-2xl md:text-3xl font-bold text-center">
                  What We Believe
                </h2>

                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[#13c8ec] text-lg font-bold">Habits are self-care</h3>
                    <p className="text-[#92c0c9] text-base leading-relaxed">
                      Every habit is an investment in your future self. We built Strive for people who take control of their wellbeing proactively — prevention, not intervention.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <h3 className="text-[#13c8ec] text-lg font-bold">Tracking isn&apos;t enough</h3>
                    <p className="text-[#92c0c9] text-base leading-relaxed">
                      Recording what you do doesn&apos;t change who you become. Strive helps you design habits with implementation intentions — specific plans for when, where, and how you&apos;ll act. The science shows this is 2-3x more effective than tracking alone.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <h3 className="text-[#13c8ec] text-lg font-bold">Identity outlasts motivation</h3>
                    <p className="text-[#92c0c9] text-base leading-relaxed">
                      &quot;I am someone who takes care of my body&quot; is more durable than &quot;I want to exercise more.&quot; Every completed habit is a vote for your identity. The goal isn&apos;t a streak — it&apos;s becoming someone for whom healthy habits feel like home.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <h3 className="text-[#13c8ec] text-lg font-bold">Social connection, not surveillance</h3>
                    <p className="text-[#92c0c9] text-base leading-relaxed">
                      Accountability works — but only when you choose it. Strive gives you complete control over what others see. We&apos;ll never use leaderboards to shame you or design features that create anxiety.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <h3 className="text-[#13c8ec] text-lg font-bold">Never miss twice</h3>
                    <p className="text-[#92c0c9] text-base leading-relaxed">
                      Everyone misses sometimes. The difference is what you do next. One miss is human. Two is a new pattern. Strive helps you recover, not punish yourself.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <h3 className="text-[#13c8ec] text-lg font-bold">The app is a tool, not a crutch</h3>
                    <p className="text-[#92c0c9] text-base leading-relaxed">
                      We succeed when you don&apos;t need us anymore. No dark patterns, no anxiety notifications, no dependency by design. The goal is a life where Strive becomes optional.
                    </p>
                  </div>
                </div>
              </section>

              {/* What We Won't Do */}
              <section className="flex flex-col gap-4">
                <h2 className="text-white text-2xl md:text-3xl font-bold text-center">
                  What We Won&apos;t Do
                </h2>
                <p className="text-[#92c0c9] text-base leading-relaxed text-center max-w-2xl mx-auto">
                  No dark patterns. No shame-based comparison. No anxiety notifications. No data exploitation. No false promises about changing your life in 21 days.
                </p>
              </section>

              {/* Who Strive Is For */}
              <section className="flex flex-col gap-4">
                <h2 className="text-white text-2xl md:text-3xl font-bold text-center">
                  Who Strive Is For
                </h2>
                <p className="text-[#92c0c9] text-base leading-relaxed text-center max-w-2xl mx-auto">
                  High-agency individuals building personal habits. Teams and groups growing together with shared accountability. Schools supporting student wellbeing with the right balance of visibility and privacy.
                </p>
              </section>

              {/* Origin Story */}
              <section className="flex flex-col gap-4">
                <h2 className="text-white text-2xl md:text-3xl font-bold text-center">
                  Where Strive Came From
                </h2>
                <p className="text-[#92c0c9] text-base leading-relaxed text-center max-w-2xl mx-auto">
                  Strive started in a Wellbeing class at REAL School Budapest, where students tracked habits in Google Sheets. The approach worked, but the tools didn&apos;t. Strive is the purpose-built solution we wished existed.
                </p>
              </section>

              {/* CTA */}
              <section className="flex flex-col items-center gap-6 px-4 py-10 bg-[#192f33]/50 rounded-2xl">
                <h2 className="text-white text-2xl md:text-3xl font-bold text-center">
                  Ready to take control?
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
