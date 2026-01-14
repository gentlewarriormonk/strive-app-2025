// Habit categories from PRD
export type HabitCategory =
  | 'Sleep'
  | 'Movement'
  | 'Focus & Study'
  | 'Mindfulness & Emotion'
  | 'Social & Connection'
  | 'Nutrition & Hydration'
  | 'Digital Hygiene'
  | 'Other';

// Visibility options for habits
export type HabitVisibility =
  | 'PUBLIC_TO_CLASS'      // Visible to everyone in the group
  | 'ANONYMISED_ONLY'      // Contributes to stats but not shown by name
  | 'PRIVATE_TO_PEERS';    // Only visible to student + teachers

// Schedule frequency types
export type ScheduleFrequency =
  | 'DAILY'
  | 'WEEKLY'               // X times per week
  | 'SPECIFIC_DAYS';       // Specific days of week

// User roles
export type UserRole = 'STUDENT' | 'TEACHER' | 'SCHOOL_ADMIN' | 'PLATFORM_ADMIN';

// Level names based on XP
export const LEVEL_NAMES = [
  'Starter',    // Level 1
  'Explorer',   // Level 2
  'Builder',    // Level 3
  'Guide',      // Level 4
  'Mentor',     // Level 5+
] as const;

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  schoolId?: string;
  xp: number;
  level: number;
  createdAt: Date;
}

export interface School {
  id: string;
  name: string;
  code: string;
  createdAt: Date;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  schoolId: string;
  teacherId: string;
  joinCode: string;
  createdAt: Date;
}

export interface GroupMembership {
  id: string;
  groupId: string;
  userId: string;
  joinedAt: Date;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: HabitCategory;
  visibility: HabitVisibility;
  scheduleFrequency: ScheduleFrequency;
  scheduleDays?: number[];     // 0 = Sunday, 1 = Monday, etc.
  timesPerWeek?: number;       // For WEEKLY frequency
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  userId: string;
  date: Date;                  // The date of completion (day only)
  createdAt: Date;             // When the completion was logged
}

// Computed habit stats (not stored, derived from completions)
export interface HabitStats {
  habitId: string;
  totalDays: number;           // Days since start
  completedDays: number;
  completionRate: number;      // 0-100
  currentStreak: number;
  longestStreak: number;
  completionsThisWeek: number;
  completionsThisMonth: number;
}

export interface Challenge {
  id: string;
  name: string;
  description?: string;
  groupId: string;
  createdByUserId: string;
  targetCategory?: HabitCategory;
  targetType: 'COMPLETIONS_PER_WEEK' | 'STREAK_DAYS';
  targetValue: number;         // e.g., 5 completions or 7 day streak
  startDate: Date;
  endDate: Date;
  rewardXp: number;
  badgeName?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface ChallengeParticipation {
  id: string;
  challengeId: string;
  userId: string;
  progress: number;            // Current progress toward target
  isCompleted: boolean;
  completedAt?: Date;
  joinedAt: Date;
}

// Category icons and colors for UI
export const CATEGORY_CONFIG: Record<HabitCategory, { icon: string; color: string; bgColor: string }> = {
  'Sleep': { icon: 'nights_stay', color: 'text-blue-300', bgColor: 'bg-blue-900/40' },
  'Movement': { icon: 'directions_run', color: 'text-green-300', bgColor: 'bg-green-900/40' },
  'Focus & Study': { icon: 'auto_stories', color: 'text-purple-300', bgColor: 'bg-purple-900/40' },
  'Mindfulness & Emotion': { icon: 'self_improvement', color: 'text-pink-300', bgColor: 'bg-pink-900/40' },
  'Social & Connection': { icon: 'groups', color: 'text-orange-300', bgColor: 'bg-orange-900/40' },
  'Nutrition & Hydration': { icon: 'water_drop', color: 'text-teal-300', bgColor: 'bg-teal-900/40' },
  'Digital Hygiene': { icon: 'phone_android', color: 'text-indigo-300', bgColor: 'bg-indigo-900/40' },
  'Other': { icon: 'category', color: 'text-gray-300', bgColor: 'bg-gray-900/40' },
};

// XP calculation helpers
export const XP_PER_COMPLETION = 10;
export const STREAK_MULTIPLIERS = {
  3: 1.2,   // 3+ days: 1.2x
  7: 1.5,   // 7+ days: 1.5x
  30: 2.0,  // 30+ days: 2x
} as const;

// Level thresholds
export const LEVEL_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  300,    // Level 3
  600,    // Level 4
  1000,   // Level 5
  1500,   // Level 6
  2100,   // Level 7
  2800,   // Level 8
  3600,   // Level 9
  4500,   // Level 10+
] as const;

// Helper to calculate level from XP
export function getLevelFromXP(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

// Helper to get XP needed for next level
export function getXPForNextLevel(currentLevel: number): number {
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + (currentLevel - LEVEL_THRESHOLDS.length + 1) * 1000;
  }
  return LEVEL_THRESHOLDS[currentLevel];
}

// Helper to get level name
export function getLevelName(level: number): string {
  if (level >= 5) return LEVEL_NAMES[4];
  return LEVEL_NAMES[level - 1] || LEVEL_NAMES[0];
}



