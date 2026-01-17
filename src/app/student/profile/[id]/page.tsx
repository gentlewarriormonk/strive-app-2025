'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PageShell } from '@/components/layout/PageShell';
import { SectionCard } from '@/components/ui/SectionCard';
import { CategorySummaryCard } from '@/components/CategorySummaryCard';
import { HabitCategory, CATEGORY_CONFIG, getXPForNextLevel } from '@/types/models';

interface ProfileUser {
  id: string;
  name: string;
  image: string | null;
  role: string;
  xp: number;
  level: number;
}

interface HabitWithStats {
  id: string;
  name: string;
  category: HabitCategory;
  visibility: string;
  stats: {
    currentStreak: number;
    longestStreak: number;
    completionsThisWeek: number;
    completionRate: number;
  };
}

interface CategorySummary {
  habitCount: number;
  avgCompletion: number;
  bestStreak: number;
}

interface ProfileData {
  user: ProfileUser;
  habits: HabitWithStats[];
  categorySummaries: Record<string, CategorySummary>;
  bestStreak: number;
  viewerContext: {
    isOwnProfile: boolean;
    isTeacherOfStudent: boolean;
    canSeeAllHabits: boolean;
  };
}

export default function StudentProfilePage() {
  const params = useParams();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/student/profile/${id}`);
        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
        } else if (response.status === 404) {
          setError('User not found');
        } else {
          setError('Failed to load profile');
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, [id]);

  // Loading state
  if (isLoading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#13c8ec] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-[#92c0c9]">Loading profile...</p>
          </div>
        </div>
      </PageShell>
    );
  }

  // Error state
  if (error || !profileData) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <span className="material-symbols-outlined text-5xl text-[#92c0c9] mb-4">person_off</span>
            <h2 className="text-2xl font-bold text-white mb-2">
              {error === 'User not found' ? 'User Not Found' : 'Something went wrong'}
            </h2>
            <p className="text-[#92c0c9] mb-6">
              {error === 'User not found'
                ? "This user doesn't exist or you don't have permission to view their profile."
                : 'Unable to load this profile. Please try again later.'}
            </p>
            <Link
              href="/student/group"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#13c8ec] text-white rounded-lg hover:bg-[#13c8ec]/80 transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Back to Group
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  const { user, habits, categorySummaries, bestStreak, viewerContext } = profileData;

  // XP Progress
  const nextLevelXP = getXPForNextLevel(user.level);
  const currentLevelXP = user.level > 1 ? getXPForNextLevel(user.level - 1) : 0;
  const progressPercent = nextLevelXP > currentLevelXP
    ? ((user.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
    : 100;

  const isTeacher = user.role === 'TEACHER';

  // Convert category summaries to array for display
  const categoryArray = Object.entries(categorySummaries)
    .filter(([, summary]) => summary.habitCount > 0)
    .map(([category, summary]) => ({
      category: category as HabitCategory,
      avgCompletion: summary.avgCompletion,
      longestStreak: summary.bestStreak,
    }));

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
            {user.name?.charAt(0) || '?'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-black text-white">{user.name}</h1>
              {isTeacher && (
                <span className="px-3 py-1 rounded-full bg-[#13c8ec]/20 text-[#13c8ec] text-sm font-medium">
                  Teacher
                </span>
              )}
              {viewerContext.isOwnProfile && (
                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">
                  You
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
              {nextLevelXP - user.xp > 0 ? `${nextLevelXP - user.xp} XP until Level ${user.level + 1}` : 'Max level reached!'}
            </p>
          </div>
        </SectionCard>

        {/* Visibility Context Notice */}
        {!viewerContext.canSeeAllHabits && (
          <div className="bg-[#192f33]/50 rounded-lg p-4 border border-[#325e67]/50">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#92c0c9]">visibility</span>
              <div>
                <p className="text-white font-medium text-sm">Public Habits Only</p>
                <p className="text-[#92c0c9] text-xs mt-1">
                  You&apos;re viewing habits that {user.name} has chosen to share publicly with the group.
                  Private and anonymised habits are not shown.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Habits Section */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4">
            {viewerContext.canSeeAllHabits ? 'Habits' : 'Public Habits'}
          </h2>
          {habits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {habits.map((habit) => {
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
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium">{habit.name}</p>
                        {viewerContext.canSeeAllHabits && habit.visibility !== 'PUBLIC_TO_CLASS' && (
                          <span className="text-xs text-[#92c0c9] px-2 py-0.5 bg-[#325e67]/50 rounded">
                            {habit.visibility === 'PRIVATE_TO_PEERS' ? 'Private' : 'Anonymised'}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-4 mt-1 text-xs text-[#92c0c9]">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined !text-sm text-[#F5A623]">
                            local_fire_department
                          </span>
                          {habit.stats.currentStreak} day streak
                        </span>
                        <span>{habit.stats.completionRate}% completion</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#192f33] rounded-xl p-8 text-center">
              <p className="text-[#92c0c9]">
                {viewerContext.isOwnProfile
                  ? "You haven't created any habits yet."
                  : viewerContext.canSeeAllHabits
                    ? `${user.name} hasn't created any habits yet.`
                    : `${user.name} hasn't shared any public habits yet.`}
              </p>
            </div>
          )}
        </section>

        {/* Category Breakdown */}
        {categoryArray.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-4">Category Breakdown</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryArray.map((summary) => (
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
