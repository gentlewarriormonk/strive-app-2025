'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type HabitData = {
  name: string;
  cue: string;
  location: string;
  obstacle: string;
  backupPlan: string;
};

export default function NewHabitPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [habitData, setHabitData] = useState<HabitData>({
    name: '',
    cue: '',
    location: '',
    obstacle: '',
    backupPlan: '',
  });

  // Scroll to top instantly on mount and step change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [step]);

  const updateField = (field: keyof HabitData, value: string) => {
    setHabitData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return habitData.name.trim().length > 0;
      case 2:
        return habitData.cue.trim().length > 0 && habitData.location.trim().length > 0;
      case 3:
        return habitData.obstacle.trim().length > 0 && habitData.backupPlan.trim().length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: habitData.name,
          category: 'Other',
          cue: habitData.cue,
          location: habitData.location,
          obstacle: habitData.obstacle,
          backupPlan: habitData.backupPlan,
        }),
      });

      if (response.ok) {
        router.push('/student/today');
      } else {
        console.error('Failed to create habit');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error creating habit:', error);
      setIsSubmitting(false);
    }
  };

  const ProgressDots = () => (
    <div className="flex items-center justify-center gap-2 mt-8">
      {[1, 2, 3, 4].map((dot) => (
        <div
          key={dot}
          className={`w-2 h-2 rounded-full transition-colors ${
            dot === step
              ? 'bg-[#13c8ec]'
              : dot < step
              ? 'bg-[#13c8ec]/50'
              : 'bg-white/20'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{
        backgroundImage: 'radial-gradient(circle at top, #101f22, #0d191b, #010409)',
      }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/10">
        <Link href="/student/today" className="text-white/60 hover:text-white transition-colors">
          <span className="material-symbols-outlined">close</span>
        </Link>
        <span className="text-white/60 text-sm">Step {step} of 4</span>
        {step > 1 ? (
          <button
            onClick={handleBack}
            className="text-white/60 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        ) : (
          <div className="w-6" />
        )}
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col justify-center px-4 sm:px-8 py-12 max-w-lg mx-auto w-full">
        {/* Step 1: The Habit */}
        {step === 1 && (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-white text-2xl md:text-3xl font-bold">
                What habit do you want to build?
              </h1>
            </div>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                value={habitData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="e.g., Run for 20 minutes, Read before bed, Meditate"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#13c8ec]/50 text-lg"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && canProceed() && handleNext()}
              />
            </div>
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="w-full py-4 rounded-lg bg-[#13c8ec] text-[#101f22] font-bold text-lg hover:bg-[#0ea5c7] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
            <ProgressDots />
          </div>
        )}

        {/* Step 2: The Anchor */}
        {step === 2 && (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-white text-2xl md:text-3xl font-bold">
                When and where will you do this?
              </h1>
              <p className="text-[#92c0c9] text-base">
                Linking to something you already do makes it automatic
              </p>
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-white/60 text-sm">Right after I...</label>
                <input
                  type="text"
                  value={habitData.cue}
                  onChange={(e) => updateField('cue', e.target.value)}
                  placeholder="e.g., finish work, wake up, eat dinner"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#13c8ec]/50 text-lg"
                  autoFocus
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-white/60 text-sm">Where?</label>
                <input
                  type="text"
                  value={habitData.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  placeholder="e.g., at home, at the park, in my bedroom"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#13c8ec]/50 text-lg"
                  onKeyDown={(e) => e.key === 'Enter' && canProceed() && handleNext()}
                />
              </div>
            </div>
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="w-full py-4 rounded-lg bg-[#13c8ec] text-[#101f22] font-bold text-lg hover:bg-[#0ea5c7] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
            <ProgressDots />
          </div>
        )}

        {/* Step 3: The Obstacle */}
        {step === 3 && (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-white text-2xl md:text-3xl font-bold">
                What might get in the way?
              </h1>
              <p className="text-[#92c0c9] text-base">
                People who plan for obstacles are 2-3x more likely to succeed
              </p>
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-white/60 text-sm">The obstacle:</label>
                <input
                  type="text"
                  value={habitData.obstacle}
                  onChange={(e) => updateField('obstacle', e.target.value)}
                  placeholder="e.g., rain, feeling tired, no time"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#13c8ec]/50 text-lg"
                  autoFocus
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-white/60 text-sm">My backup plan:</label>
                <input
                  type="text"
                  value={habitData.backupPlan}
                  onChange={(e) => updateField('backupPlan', e.target.value)}
                  placeholder="e.g., do a shorter version, do it indoors"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#13c8ec]/50 text-lg"
                  onKeyDown={(e) => e.key === 'Enter' && canProceed() && handleNext()}
                />
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-[#92c0c9] text-sm">
                <span className="text-white font-medium">Your if-then plan: </span>
                If {habitData.obstacle || '[obstacle]'}, then I will {habitData.backupPlan || '[backup]'}.
              </p>
            </div>
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="w-full py-4 rounded-lg bg-[#13c8ec] text-[#101f22] font-bold text-lg hover:bg-[#0ea5c7] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
            <ProgressDots />
          </div>
        )}

        {/* Step 4: The Commitment */}
        {step === 4 && (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2 text-center">
              <h1 className="text-white text-2xl md:text-3xl font-bold">
                Your Implementation Intention
              </h1>
            </div>
            <div className="bg-[#192f33] border border-[#13c8ec]/30 rounded-xl p-6 md:p-8">
              <p className="text-white text-lg md:text-xl leading-relaxed text-center">
                After I{' '}
                <span className="text-[#13c8ec] font-semibold">{habitData.cue}</span>, I will{' '}
                <span className="text-[#13c8ec] font-semibold">{habitData.name}</span> at{' '}
                <span className="text-[#13c8ec] font-semibold">{habitData.location}</span>.
              </p>
              <p className="text-white text-lg md:text-xl leading-relaxed text-center mt-4">
                If{' '}
                <span className="text-[#13c8ec] font-semibold">{habitData.obstacle}</span>, then I
                will{' '}
                <span className="text-[#13c8ec] font-semibold">{habitData.backupPlan}</span>.
              </p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-4 rounded-lg bg-[#13c8ec] text-[#101f22] font-bold text-lg hover:bg-[#0ea5c7] transition-colors disabled:opacity-60"
            >
              {isSubmitting ? 'Creating...' : 'I commit to this'}
            </button>
            <ProgressDots />
          </div>
        )}
      </main>
    </div>
  );
}
