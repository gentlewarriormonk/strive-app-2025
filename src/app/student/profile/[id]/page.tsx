import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PageShell } from '@/components/layout/PageShell';
import { SectionCard } from '@/components/ui/SectionCard';
import { CategorySummaryCard } from '@/components/CategorySummaryCard';
import {
  getUserById,
  getUserPublicHabits,
  getHabitStats,
} from '@/lib/mockData';
import { HabitCategory, CATEGORY_CONFIG, getXPForNextLevel } from '@/types/models';

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const user = getUserById(id);

  if (!user) {
    notFound();
  }

  const publicHabits = getUserPublicHabits(user.id);
  const habitsWithStats = publicHabits.map((habit) => ({
    habit,
    stats: getHabitStats(habit.id),
  }));

  // Calculate category summaries
  const categorySummaries = Object.keys(CATEGORY_CONFIG)
    .map((cat) => {
      const categoryHabits = habitsWithStats.filter((h) => h.habit.category === cat);
      const avgCompletion =
        categoryHabits.length > 0
          ? Math.round(
              categoryHabits.reduce((sum, h) => sum + h.stats.completionRate, 0) /
                categoryHabits.length
            )
          : 0;
      const longestStreak =
        categoryHabits.length > 0
          ? Math.max(...categoryHabits.map((h) => h.stats.longestStreak))
          : 0;
      return {
        category: cat as HabitCategory,
        avgCompletion,
        longestStreak,
        hasHabits: categoryHabits.length > 0,
      };
    })
    .filter((s) => s.hasHabits);

  // XP Progress
  const nextLevelXP = getXPForNextLevel(user.level);
  const currentLevelXP = user.level > 1 ? getXPForNextLevel(user.level - 1) : 0;
  const progressPercent = ((user.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  // Best streak
  const bestStreak =
    habitsWithStats.length > 0
      ? Math.max(...habitsWithStats.map((h) => h.stats.longestStreak))
      : 0;

  const isTeacher = user.role === 'TEACHER';

  return (
    <PageShell>
      <div className="flex flex-col gap-8">
        {/* Back Link */}
        <Link
          href="/student/group"
          className="inline-flex items-center gap-2 text-[#92c0c9] hover:text-white transition-colors text-sm"
        >
          <span className="material-symbols-outlined !text-lg">arrow_back</span>
          Back to Group
        </Link>

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#13c8ec] to-[#3b82f6] flex items-center justify-center text-white text-3xl font-bold">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-black text-white">{user.name}</h1>
              {isTeacher && (
                <span className="px-3 py-1 rounded-full bg-[#13c8ec]/20 text-[#13c8ec] text-sm font-medium">
                  Teacher
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-[#92c0c9]">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined !text-lg text-[#13c8ec]">
                  military_tech
                </span>
                Level {user.level}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined !text-lg text-[#F5A623]">
                  stars
                </span>
                {user.xp} XP
              </span>
              {bestStreak > 0 && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined !text-lg text-[#F5A623]">
                    local_fire_department
                  </span>
                  Best streak: {bestStreak} days
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Level Progress */}
        <SectionCard>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-baseline">
              <p className="text-white font-medium">Level {user.level} Progress</p>
              <p className="text-sm text-[#92c0c9]">
                {user.xp} / {nextLevelXP} XP
              </p>
            </div>
            <div className="w-full bg-[#325e67] rounded-full h-3">
              <div
                className="bg-gradient-to-r from-[#13c8ec] to-[#3b82f6] h-3 rounded-full transition-all"
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-[#92c0c9]">
              {nextLevelXP - user.xp} XP until Level {user.level + 1}
            </p>
          </div>
        </SectionCard>

        {/* Public Habits */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Public Habits</h2>
          {habitsWithStats.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {habitsWithStats.map(({ habit, stats }) => {
                const config = CATEGORY_CONFIG[habit.category];
                return (
                  <div
                    key={habit.id}
                    className="bg-[#192f33] rounded-xl p-4 flex items-center gap-4"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${config.bgColor}`}
                    >
                      <span className={`material-symbols-outlined ${config.color}`}>
                        {config.icon}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{habit.name}</p>
                      <div className="flex gap-4 mt-1 text-xs text-[#92c0c9]">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined !text-sm text-[#F5A623]">
                            local_fire_department
                          </span>
                          {stats.currentStreak} day streak
                        </span>
                        <span>{stats.completionRate}% completion</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#192f33] rounded-xl p-8 text-center">
              <p className="text-[#92c0c9]">
                {user.name} hasn&apos;t shared any public habits yet.
              </p>
            </div>
          )}
        </section>

        {/* Category Breakdown */}
        {categorySummaries.length > 0 && (
          <section>
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
      </div>
    </PageShell>
  );
}

