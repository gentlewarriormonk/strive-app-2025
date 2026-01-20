'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type HabitData = {
  name: string;
  cue: string;
  location: string;
  obstacle: string;
  backupPlan: string;
};

type AISuggestions = string[] | null;

// Static obstacle options (more reliable than AI suggestions for personal context)
const defaultObstacles = [
  "Feeling tired",
  "Not enough time",
  "Forgetting",
  "Bad weather",
  "Not in the mood",
  "Interruptions"
];

// Clean up grammar for obstacle preview
function cleanObstacleGrammar(text: string): string {
  return text
    .replace(/might not be/gi, 'is not')
    .replace(/may not be/gi, 'is not')
    .replace(/might be/gi, 'is')
    .replace(/may be/gi, 'is');
}

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

  // AI suggestion states
  const [habitSuggestions, setHabitSuggestions] = useState<AISuggestions>(null);
  const [cueSuggestions, setCueSuggestions] = useState<AISuggestions>(null);
  const [backupSuggestions, setBackupSuggestions] = useState<AISuggestions>(null);
  const [polishedIntention, setPolishedIntention] = useState<string | null>(null);

  // Loading states
  const [loadingHabitSuggestions, setLoadingHabitSuggestions] = useState(false);
  const [loadingCueSuggestions, setLoadingCueSuggestions] = useState(false);
  const [loadingBackupSuggestions, setLoadingBackupSuggestions] = useState(false);
  const [loadingPolish, setLoadingPolish] = useState(false);

  // Debounce refs
  const habitDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const cueDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const backupDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to top instantly on mount and step change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [step]);

  // AI assist API call
  const callAI = useCallback(async (task: string, inputs: Record<string, string>) => {
    try {
      const response = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, inputs }),
      });
      const data = await response.json();
      if (data.fallback) return null;
      return data.suggestions || data.result || null;
    } catch {
      return null;
    }
  }, []);

  // Fetch habit suggestions with debounce
  const fetchHabitSuggestions = useCallback(async (habit: string) => {
    if (habit.trim().length < 3) {
      setHabitSuggestions(null);
      return;
    }
    setLoadingHabitSuggestions(true);
    const suggestions = await callAI('suggest-habits', { habit });
    setHabitSuggestions(suggestions);
    setLoadingHabitSuggestions(false);
  }, [callAI]);

  // Fetch cue suggestions with debounce
  const fetchCueSuggestions = useCallback(async (cue: string) => {
    if (cue.trim().length < 3 || !habitData.name) {
      setCueSuggestions(null);
      return;
    }
    setLoadingCueSuggestions(true);
    const suggestions = await callAI('suggest-cues', { habit: habitData.name, cue });
    setCueSuggestions(suggestions);
    setLoadingCueSuggestions(false);
  }, [callAI, habitData.name]);

  // Fetch backup suggestions with debounce
  const fetchBackupSuggestions = useCallback(async (obstacle: string) => {
    if (obstacle.trim().length < 3 || !habitData.name) {
      setBackupSuggestions(null);
      return;
    }
    setLoadingBackupSuggestions(true);
    const suggestions = await callAI('suggest-backups', { habit: habitData.name, obstacle });
    setBackupSuggestions(suggestions);
    setLoadingBackupSuggestions(false);
  }, [callAI, habitData.name]);

  // Polish intention on step 4 load
  const fetchPolishedIntention = useCallback(async () => {
    setLoadingPolish(true);
    const result = await callAI('polish-intention', {
      habit: habitData.name,
      cue: habitData.cue,
      location: habitData.location,
      obstacle: habitData.obstacle,
      backup: habitData.backupPlan,
    });
    setPolishedIntention(result);
    setLoadingPolish(false);
  }, [callAI, habitData]);

  // Debounced habit input handler
  const handleHabitChange = (value: string) => {
    setHabitData(prev => ({ ...prev, name: value }));
    setHabitSuggestions(null);

    if (habitDebounceRef.current) clearTimeout(habitDebounceRef.current);
    habitDebounceRef.current = setTimeout(() => {
      fetchHabitSuggestions(value);
    }, 800);
  };

  // Debounced cue input handler
  const handleCueChange = (value: string) => {
    setHabitData(prev => ({ ...prev, cue: value }));
    setCueSuggestions(null);

    if (cueDebounceRef.current) clearTimeout(cueDebounceRef.current);
    cueDebounceRef.current = setTimeout(() => {
      fetchCueSuggestions(value);
    }, 800);
  };

  // Debounced obstacle change handler
  const handleObstacleChange = (value: string) => {
    setHabitData(prev => ({ ...prev, obstacle: value }));
    setBackupSuggestions(null);

    if (backupDebounceRef.current) clearTimeout(backupDebounceRef.current);
    backupDebounceRef.current = setTimeout(() => {
      fetchBackupSuggestions(value);
    }, 800);
  };

  // Fetch polished intention when entering step 4
  useEffect(() => {
    if (step === 4 && !polishedIntention && !loadingPolish) {
      fetchPolishedIntention();
    }
  }, [step, polishedIntention, loadingPolish, fetchPolishedIntention]);

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

  const LoadingSpinner = () => (
    <div className="flex items-center gap-2 text-[#92c0c9] text-sm">
      <div className="animate-spin w-4 h-4 border-2 border-[#13c8ec] border-t-transparent rounded-full" />
      <span>Getting suggestions...</span>
    </div>
  );

  const SuggestionRadios = ({
    suggestions,
    currentValue,
    onSelect,
    loading,
  }: {
    suggestions: string[] | null;
    currentValue: string;
    onSelect: (value: string) => void;
    loading: boolean;
  }) => {
    if (loading) return <LoadingSpinner />;
    if (!suggestions || suggestions.length === 0) return null;

    return (
      <div className="flex flex-col gap-2 mt-4">
        <p className="text-[#92c0c9] text-xs uppercase tracking-wide">Suggestions</p>
        {suggestions.map((suggestion, i) => (
          <label
            key={i}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              currentValue === suggestion
                ? 'border-[#13c8ec] bg-[#13c8ec]/10'
                : 'border-white/10 hover:border-white/20'
            }`}
          >
            <input
              type="radio"
              name="suggestion"
              checked={currentValue === suggestion}
              onChange={() => onSelect(suggestion)}
              className="sr-only"
            />
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                currentValue === suggestion ? 'border-[#13c8ec]' : 'border-white/40'
              }`}
            >
              {currentValue === suggestion && (
                <div className="w-2 h-2 rounded-full bg-[#13c8ec]" />
              )}
            </div>
            <span className="text-white text-sm">{suggestion}</span>
          </label>
        ))}
        <label
          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
            currentValue && !suggestions.includes(currentValue)
              ? 'border-[#13c8ec] bg-[#13c8ec]/10'
              : 'border-white/10 hover:border-white/20'
          }`}
        >
          <input
            type="radio"
            name="suggestion"
            checked={currentValue !== '' && !suggestions.includes(currentValue)}
            onChange={() => {}}
            className="sr-only"
          />
          <div
            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              currentValue && !suggestions.includes(currentValue) ? 'border-[#13c8ec]' : 'border-white/40'
            }`}
          >
            {currentValue && !suggestions.includes(currentValue) && (
              <div className="w-2 h-2 rounded-full bg-[#13c8ec]" />
            )}
          </div>
          <span className="text-white/60 text-sm">Keep my version</span>
        </label>
      </div>
    );
  };

  // Fallback template for polished intention
  const getTemplateIntention = () => {
    return `After I ${habitData.cue}, I will ${habitData.name} at ${habitData.location}. If ${cleanObstacleGrammar(habitData.obstacle.toLowerCase())}, I will ${habitData.backupPlan}.`;
  };

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
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-white text-2xl md:text-3xl font-bold">
                What habit do you want to build?
              </h1>
              <p className="text-[#92c0c9] text-sm">
                Be specific — &quot;run for 20 minutes&quot; works better than &quot;exercise more&quot;
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                value={habitData.name}
                onChange={(e) => handleHabitChange(e.target.value)}
                placeholder="e.g., Run for 20 minutes, Read before bed, Meditate"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#13c8ec]/50 text-lg"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && canProceed() && handleNext()}
              />
              <SuggestionRadios
                suggestions={habitSuggestions}
                currentValue={habitData.name}
                onSelect={(value) => setHabitData(prev => ({ ...prev, name: value }))}
                loading={loadingHabitSuggestions}
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
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-white text-2xl md:text-3xl font-bold">
                When and where will you do this?
              </h1>
              <p className="text-[#92c0c9] text-sm">
                Linking a new habit to something you already do makes it automatic. This is called &quot;habit stacking.&quot;
              </p>
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-white/60 text-sm">Right after I...</label>
                <input
                  type="text"
                  value={habitData.cue}
                  onChange={(e) => handleCueChange(e.target.value)}
                  placeholder="e.g., finish work, wake up, eat dinner"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#13c8ec]/50 text-lg"
                  autoFocus
                />
                <SuggestionRadios
                  suggestions={cueSuggestions}
                  currentValue={habitData.cue}
                  onSelect={(value) => setHabitData(prev => ({ ...prev, cue: value }))}
                  loading={loadingCueSuggestions}
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
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-white text-2xl md:text-3xl font-bold">
                What might get in the way?
              </h1>
              <p className="text-[#92c0c9] text-sm">
                People who plan for obstacles are 2-3x more likely to succeed. This is called &quot;if-then planning.&quot;
              </p>
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-white/60 text-sm">The obstacle:</label>
                <input
                  type="text"
                  value={habitData.obstacle}
                  onChange={(e) => handleObstacleChange(e.target.value)}
                  placeholder="e.g., rain, feeling tired, no time"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#13c8ec]/50 text-lg"
                  autoFocus
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {defaultObstacles.map((obstacle, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setHabitData(prev => ({ ...prev, obstacle }));
                        fetchBackupSuggestions(obstacle);
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        habitData.obstacle === obstacle
                          ? 'bg-[#13c8ec] text-[#101f22]'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {obstacle}
                    </button>
                  ))}
                </div>
              </div>
              {habitData.obstacle.trim().length > 0 && (
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
                  <SuggestionRadios
                    suggestions={backupSuggestions}
                    currentValue={habitData.backupPlan}
                    onSelect={(value) => setHabitData(prev => ({ ...prev, backupPlan: value }))}
                    loading={loadingBackupSuggestions}
                  />
                </div>
              )}
            </div>
            {habitData.obstacle && habitData.backupPlan && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <p className="text-[#92c0c9] text-sm">
                  <span className="text-white font-medium">Your if-then plan: </span>
                  If {cleanObstacleGrammar(habitData.obstacle.toLowerCase())}, then I will {habitData.backupPlan}.
                </p>
              </div>
            )}
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
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 text-center">
              <h1 className="text-white text-2xl md:text-3xl font-bold">
                Your Implementation Intention
              </h1>
              <p className="text-[#92c0c9] text-sm">
                Research shows that writing down a specific plan like this dramatically increases follow-through.
              </p>
            </div>

            {loadingPolish ? (
              <div className="bg-[#192f33] border border-[#13c8ec]/30 rounded-xl p-6 md:p-8 text-center">
                <div className="flex items-center justify-center gap-2 text-[#92c0c9]">
                  <div className="animate-spin w-5 h-5 border-2 border-[#13c8ec] border-t-transparent rounded-full" />
                  <span>Polishing your intention...</span>
                </div>
              </div>
            ) : (
              <div className="bg-[#192f33] border border-[#13c8ec]/30 rounded-xl p-6 md:p-8">
                <p className="text-white text-lg md:text-xl leading-relaxed text-center">
                  {polishedIntention || getTemplateIntention()}
                </p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || loadingPolish}
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
