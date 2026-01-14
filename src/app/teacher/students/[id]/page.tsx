import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SectionCard } from '@/components/ui/SectionCard';
import { CategorySummaryCard } from '@/components/CategorySummaryCard';
import {
  getUserById,
  getUserHabits,
  getHabitStats,
  getUserChallengeParticipation,
  challenges,
} from '@/lib/mockData';
import { HabitCategory, CATEGORY_CONFIG } from '@/types/models';

interface StudentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TeacherStudentDetailPage({ params }: StudentDetailPageProps) {
  const { id } = await params;
  const student = getUserById(id);

  if (!student || student.role !== 'STUDENT') {
    notFound();
  }

  // Get ALL habits (teacher can see all)
  const studentHabits = getUserHabits(student.id);
  const habitsWithStats = studentHabits.map((habit) => ({
    habit,
    stats: getHabitStats(habit.id),
  }));

  // Challenge participations
  const participations = getUserChallengeParticipation(student.id);
  const activeParticipations = participations.filter((p) => {
    const challenge = challenges.find((c) => c.id === p.challengeId);
    return challenge?.isActive;
  });

  // Calculate overall stats
  const avgCompletion =
    habitsWithStats.length > 0
      ? Math.round(
          habitsWithStats.reduce((sum, h) => sum + h.stats.completionRate, 0) /
            habitsWithStats.length
        )
      : 0;

  const bestStreak =
    habitsWithStats.length > 0
      ? Math.max(...habitsWithStats.map((h) => h.stats.longestStreak))
      : 0;

  const totalCompletionsThisWeek = habitsWithStats.reduce(
    (sum, h) => sum + h.stats.completionsThisWeek,
    0
  );

  // Category breakdown
  const categorySummaries = Object.keys(CATEGORY_CONFIG)
    .map((cat) => {
      const categoryHabits = habitsWithStats.filter((h) => h.habit.category === cat);
      const avgCatCompletion =
        categoryHabits.length > 0
          ? Math.round(
              categoryHabits.reduce((sum, h) => sum + h.stats.completionRate, 0) /
                categoryHabits.length
            )
          : 0;
      const longestCatStreak =
        categoryHabits.length > 0
          ? Math.max(...categoryHabits.map((h) => h.stats.longestStreak))
          : 0;
      return {
        category: cat as HabitCategory,
        avgCompletion: avgCatCompletion,
        longestStreak: longestCatStreak,
        hasHabits: categoryHabits.length > 0,
      };
    })
    .filter((s) => s.hasHabits);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      {/* Back Link */}
      <Link
        href="/teacher/dashboard"
        className="inline-flex items-center gap-2 text-[#92c0c9] hover:text-white transition-colors text-sm mb-6"
      >
        <span className="material-symbols-outlined !text-lg">arrow_back</span>
        Back to Dashboard
      </Link>

      {/* Student Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#13c8ec] to-[#3b82f6] flex items-center justify-center text-white text-2xl font-bold">
          {student.name.charAt(0)}
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-black text-white mb-2">{student.name}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-[#92c0c9]">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined !text-lg text-[#13c8ec]">
                military_tech
              </span>
              Level {student.level}
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined !text-lg text-[#F5A623]">stars</span>
              {student.xp} XP
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined !text-lg">check_circle</span>
              {studentHabits.length} active habits
            </span>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <SectionCard padding="md">
          <div className="text-center">
            <p className="text-3xl font-bold gradient-text">{avgCompletion}%</p>
            <p className="text-[#92c0c9] text-sm mt-1">Avg. Completion</p>
          </div>
        </SectionCard>
        <SectionCard padding="md">
          <div className="text-center">
            <p className="text-3xl font-bold text-[#F5A623]">{bestStreak}</p>
            <p className="text-[#92c0c9] text-sm mt-1">Best Streak (days)</p>
          </div>
        </SectionCard>
        <SectionCard padding="md">
          <div className="text-center">
            <p className="text-3xl font-bold text-white">{totalCompletionsThisWeek}</p>
            <p className="text-[#92c0c9] text-sm mt-1">Completions This Week</p>
          </div>
        </SectionCard>
        <SectionCard padding="md">
          <div className="text-center">
            <p className="text-3xl font-bold text-white">{activeParticipations.length}</p>
            <p className="text-[#92c0c9] text-sm mt-1">Active Challenges</p>
          </div>
        </SectionCard>
      </div>

      {/* All Habits (Teacher can see all, including private) */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">All Habits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habitsWithStats.map(({ habit, stats }) => {
            const config = CATEGORY_CONFIG[habit.category];
            const isPrivate = habit.visibility !== 'PUBLIC_TO_CLASS';

            return (
              <div
                key={habit.id}
                className={`bg-[#192f33] rounded-xl p-4 flex items-start gap-4 ${
                  isPrivate ? 'border border-dashed border-[#325e67]' : ''
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${config.bgColor}`}
                >
                  <span className={`material-symbols-outlined ${config.color}`}>
                    {config.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-white font-medium">{habit.name}</p>
                    {isPrivate && (
                      <span className="flex-shrink-0 text-xs text-[#92c0c9] bg-[#234248] px-2 py-0.5 rounded">
                        {habit.visibility === 'PRIVATE_TO_PEERS' ? 'Private' : 'Anonymous'}
                      </span>
                    )}
                  </div>
                  <p className="text-[#92c0c9] text-xs mt-1">{habit.category}</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-[#92c0c9]">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined !text-sm text-[#F5A623]">
                        local_fire_department
                      </span>
                      {stats.currentStreak} day streak
                    </span>
                    <span>{stats.completionRate}% completion</span>
                    <span>{stats.completionsThisWeek}/7 this week</span>
                  </div>
                </div>
              </div>
            );
          })}

          {habitsWithStats.length === 0 && (
            <div className="col-span-2 bg-[#192f33] rounded-xl p-8 text-center">
              <p className="text-[#92c0c9]">{student.name} hasn&apos;t created any habits yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Category Breakdown */}
      {categorySummaries.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Category Breakdown</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categorySummaries.map((summary) => (
              <CategorySummaryCard
                key={summary.category}
                category={summary.category}
                avgCompletion={summary.avgCompletion}
                longestStreak={summary.longestStreak}
              />
            ))}
          </div>
        </section>
      )}

      {/* Challenge Participation */}
      {activeParticipations.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Challenge Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeParticipations.map((participation) => {
              const challenge = challenges.find((c) => c.id === participation.challengeId);
              if (!challenge) return null;

              const progressPercent = Math.min(
                (participation.progress / challenge.targetValue) * 100,
                100
              );

              return (
                <SectionCard key={participation.id} padding="md">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-bold">{challenge.name}</h3>
                      <p className="text-[#92c0c9] text-xs mt-1">
                        {challenge.targetType === 'STREAK_DAYS' ? 'Streak' : 'Completions'} challenge
                      </p>
                    </div>
                    {participation.isCompleted && (
                      <span className="flex items-center gap-1 text-green-400 text-sm">
                        <span className="material-symbols-outlined !text-lg">check_circle</span>
                        Done
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#92c0c9]">Progress</span>
                      <span className="text-white font-medium">
                        {participation.progress} / {challenge.targetValue}
                      </span>
                    </div>
                    <div className="w-full bg-[#325e67] rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          participation.isCompleted
                            ? 'bg-green-400'
                            : 'bg-gradient-to-r from-[#13c8ec] to-[#3b82f6]'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </SectionCard>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}



