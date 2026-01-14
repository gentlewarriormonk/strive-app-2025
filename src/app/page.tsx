'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';

const previewScreens = {
  studentDashboard: "/screens/student-dashboard.png",
  studentProgress: "/screens/student-progress.png",
  teacherDashboard: "/screens/teacher-dashboard.png",
  groupView: "/screens/group-view.png",
} as const;

const screenPreviews = [
  {
    id: 'studentDashboard',
    label: 'Student dashboard',
    description: 'Students see today\'s habits and streaks at a glance.',
    imageSrc: previewScreens.studentDashboard,
  },
  {
    id: 'studentProgress',
    label: 'Student progress',
    description: '28-day completion trends and category stats.',
    imageSrc: previewScreens.studentProgress,
  },
  {
    id: 'teacherDashboard',
    label: 'Teacher dashboard',
    description: 'Monitor class wellbeing, challenges and XP.',
    imageSrc: previewScreens.teacherDashboard,
  },
  {
    id: 'groupView',
    label: 'Group view',
    description: 'See which students are thriving and who needs support.',
    imageSrc: previewScreens.groupView,
  },
];

export default function LandingPage() {
  const [selectedScreenId, setSelectedScreenId] = useState(screenPreviews[0].id);
  const selectedScreen = screenPreviews.find(s => s.id === selectedScreenId) || screenPreviews[0];

  const scrollToHowItWorks = () => {
    const element = document.getElementById('how-it-works');
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
                      Build better wellbeing habits together in class.
                    </h1>
                    <p className="text-[#92c0c9] text-base md:text-lg font-normal leading-relaxed">
                      Empower your students with the tools they need to thrive, track progress, and foster a positive classroom environment.
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
                      onClick={scrollToHowItWorks}
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

              {/* Features Section */}
              <section id="teachers" className="flex flex-col gap-6">
                <h2 className="text-white text-2xl font-bold text-center">
                  A toolkit for modern wellbeing education
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                  <div className="flex flex-1 flex-col gap-4 rounded-xl border border-white/10 bg-[#192f33] p-6 hover:border-[#13c8ec]/30 transition-colors">
                    <div className="text-[#13c8ec]">
                      <span className="material-symbols-outlined text-3xl">school</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-white text-lg font-bold">For Teachers</h3>
                      <p className="text-[#92c0c9] text-sm leading-relaxed">
                        Gain insights into classroom wellbeing and support individual student growth with easy-to-use tools.
                      </p>
                    </div>
                  </div>
                  <div id="students" className="flex flex-1 flex-col gap-4 rounded-xl border border-white/10 bg-[#192f33] p-6 hover:border-[#13c8ec]/30 transition-colors">
                    <div className="text-[#13c8ec]">
                      <span className="material-symbols-outlined text-3xl">sentiment_satisfied</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-white text-lg font-bold">For Students</h3>
                      <p className="text-[#92c0c9] text-sm leading-relaxed">
                        Engage with interactive tools to build healthy habits, track personal progress, and feel empowered.
                      </p>
                    </div>
                  </div>
                  <div id="schools" className="flex flex-1 flex-col gap-4 rounded-xl border border-white/10 bg-[#192f33] p-6 hover:border-[#13c8ec]/30 transition-colors">
                    <div className="text-[#13c8ec]">
                      <span className="material-symbols-outlined text-3xl">shield</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-white text-lg font-bold">For Schools</h3>
                      <p className="text-[#92c0c9] text-sm leading-relaxed">
                        Implement a school-wide wellbeing program with comprehensive data, resources, and reporting.
                      </p>
                    </div>
                  </div>
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
                        Teachers and students collaborate to set meaningful wellbeing goals for the classroom.
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
                        Students track their habits daily through an engaging, user-friendly interface.
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
                        Visualize progress, celebrate milestones, and foster a supportive class environment.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* See Strive in Action Section */}
              <section className="flex flex-col gap-8 px-4">
                <div className="text-center">
                  <h2 className="text-white text-2xl font-bold">
                    See Strive in action
                  </h2>
                  <p className="text-[#92c0c9] text-base mt-2">
                    Preview the student and teacher dashboards before you sign in.
                  </p>
                </div>

                {/* Screen Pills */}
                <div className="flex flex-wrap justify-center gap-2">
                  {screenPreviews.map((screen) => (
                    <button
                      key={screen.id}
                      onClick={() => setSelectedScreenId(screen.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedScreenId === screen.id
                          ? 'bg-[#13c8ec] text-[#101f22] border-2 border-[#13c8ec]'
                          : 'bg-[#192f33] text-white border-2 border-white/10 hover:border-[#13c8ec]/50'
                      }`}
                    >
                      {screen.label}
                    </button>
                  ))}
                </div>

                {/* Preview Card */}
                <div className="flex flex-col gap-4 rounded-xl bg-[#192f33] border border-white/10 p-4 md:p-6">
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-[#101f22]">
                    {screenPreviews.map((screen) => (
                      <div
                        key={screen.id}
                        className={`absolute inset-0 transition-all duration-300 ease-out ${
                          selectedScreenId === screen.id
                            ? 'opacity-100 scale-100 z-10'
                            : 'opacity-0 scale-95 pointer-events-none z-0'
                        }`}
                      >
                        {screen.imageSrc && (
                          <Image
                            src={screen.imageSrc}
                            alt={screen.label}
                            fill
                            className="object-cover object-top"
                            sizes="(max-width: 768px) 100vw, 1100px"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-[#92c0c9] text-sm text-center transition-opacity duration-200">
                    {selectedScreen.description}
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

              {/* CTA Section */}
              <section className="flex flex-col items-center gap-6 px-4 py-12 bg-[#192f33]/50 rounded-2xl mx-4">
                <h2 className="text-white text-2xl md:text-3xl font-bold text-center">
                  Ready to help your students thrive?
                </h2>
                <p className="text-[#92c0c9] text-center max-w-xl">
                  Join teachers around the world who are using Strive to build better wellbeing habits in their classrooms.
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
