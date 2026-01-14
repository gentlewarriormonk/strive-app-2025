import { prisma } from './prisma';
import {
  User,
  Group,
  Habit,
  HabitCompletion,
  Challenge,
  ChallengeParticipation,
  HabitCategory as PrismaHabitCategory,
} from '@prisma/client';
import type { HabitStats, HabitCategory } from '@/types/models';

// ============================================
// Type Conversion Helpers
// ============================================

// Map Prisma HabitCategory enum to display string
const categoryDisplayMap: Record<PrismaHabitCategory, HabitCategory> = {
  Sleep: 'Sleep',
  Movement: 'Movement',
  FocusStudy: 'Focus & Study',
  MindfulnessEmotion: 'Mindfulness & Emotion',
  SocialConnection: 'Social & Connection',
  NutritionHydration: 'Nutrition & Hydration',
  DigitalHygiene: 'Digital Hygiene',
  Other: 'Other',
};

// Map display string to Prisma HabitCategory enum
const categoryPrismaMap: Record<HabitCategory, PrismaHabitCategory> = {
  'Sleep': 'Sleep',
  'Movement': 'Movement',
  'Focus & Study': 'FocusStudy',
  'Mindfulness & Emotion': 'MindfulnessEmotion',
  'Social & Connection': 'SocialConnection',
  'Nutrition & Hydration': 'NutritionHydration',
  'Digital Hygiene': 'DigitalHygiene',
  'Other': 'Other',
};

export function toDisplayCategory(category: PrismaHabitCategory): HabitCategory {
  return categoryDisplayMap[category];
}

export function toPrismaCategory(category: HabitCategory): PrismaHabitCategory {
  return categoryPrismaMap[category];
}

// ============================================
// User Functions
// ============================================

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: { school: true },
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: { school: true },
  });
}

export async function updateUserXP(userId: string, xpToAdd: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const newXP = user.xp + xpToAdd;
  const newLevel = calculateLevel(newXP);

  return prisma.user.update({
    where: { id: userId },
    data: { xp: newXP, level: newLevel },
  });
}

function calculateLevel(xp: number): number {
  const thresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500];
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (xp >= thresholds[i]) return i + 1;
  }
  return 1;
}

// ============================================
// School Functions
// ============================================

export async function getSchoolById(id: string) {
  return prisma.school.findUnique({ where: { id } });
}

export async function getSchoolByCode(code: string) {
  return prisma.school.findUnique({ where: { code } });
}

export async function createSchool(name: string, code: string) {
  return prisma.school.create({
    data: { name, code },
  });
}

// ============================================
// Group Functions
// ============================================

export async function getGroupById(id: string) {
  return prisma.group.findUnique({
    where: { id },
    include: { school: true, teacher: true },
  });
}

export async function getGroupByJoinCode(joinCode: string) {
  return prisma.group.findUnique({
    where: { joinCode },
    include: { school: true, teacher: true },
  });
}

export async function getGroupMembers(groupId: string) {
  const memberships = await prisma.groupMembership.findMany({
    where: { groupId },
    include: { user: true },
  });
  return memberships.map((m) => m.user);
}

export async function getGroupStudents(groupId: string) {
  const memberships = await prisma.groupMembership.findMany({
    where: { groupId },
    include: { user: true },
  });
  return memberships.map((m) => m.user).filter((u) => u.role === 'STUDENT');
}

export async function getUserGroups(userId: string) {
  const memberships = await prisma.groupMembership.findMany({
    where: { userId },
    include: { group: { include: { school: true, teacher: true } } },
  });
  return memberships.map((m) => m.group);
}

export async function getTeacherGroups(teacherId: string) {
  return prisma.group.findMany({
    where: { teacherId },
    include: { school: true, memberships: { include: { user: true } } },
  });
}

export async function createGroup(data: {
  name: string;
  description?: string;
  schoolId: string;
  teacherId: string;
  joinCode: string;
}) {
  return prisma.group.create({ data });
}

export async function joinGroup(groupId: string, userId: string) {
  return prisma.groupMembership.create({
    data: { groupId, userId },
  });
}

// ============================================
// Habit Functions
// ============================================

export async function getUserHabits(userId: string) {
  return prisma.habit.findMany({
    where: { userId, isActive: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getUserPublicHabits(userId: string) {
  return prisma.habit.findMany({
    where: {
      userId,
      isActive: true,
      visibility: 'PUBLIC_TO_CLASS',
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getHabitById(id: string) {
  return prisma.habit.findUnique({ where: { id } });
}

export async function createHabit(data: {
  userId: string;
  name: string;
  description?: string;
  category: HabitCategory;
  visibility?: 'PUBLIC_TO_CLASS' | 'ANONYMISED_ONLY' | 'PRIVATE_TO_PEERS';
  scheduleFrequency?: 'DAILY' | 'WEEKLY' | 'SPECIFIC_DAYS';
  scheduleDays?: number[];
  timesPerWeek?: number;
  startDate?: Date;
}) {
  return prisma.habit.create({
    data: {
      ...data,
      category: toPrismaCategory(data.category),
      visibility: data.visibility || 'PUBLIC_TO_CLASS',
      scheduleFrequency: data.scheduleFrequency || 'DAILY',
      scheduleDays: data.scheduleDays || [],
    },
  });
}

export async function updateHabit(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    category: HabitCategory;
    visibility: 'PUBLIC_TO_CLASS' | 'ANONYMISED_ONLY' | 'PRIVATE_TO_PEERS';
    scheduleFrequency: 'DAILY' | 'WEEKLY' | 'SPECIFIC_DAYS';
    scheduleDays: number[];
    timesPerWeek: number;
    isActive: boolean;
  }>
) {
  const updateData: Record<string, unknown> = { ...data };
  if (data.category) {
    updateData.category = toPrismaCategory(data.category);
  }
  return prisma.habit.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteHabit(id: string) {
  return prisma.habit.update({
    where: { id },
    data: { isActive: false },
  });
}

// ============================================
// Habit Completion Functions
// ============================================

export async function getHabitCompletions(habitId: string) {
  return prisma.habitCompletion.findMany({
    where: { habitId },
    orderBy: { date: 'desc' },
  });
}

export async function getHabitCompletionsInRange(
  habitId: string,
  startDate: Date,
  endDate: Date
) {
  return prisma.habitCompletion.findMany({
    where: {
      habitId,
      date: { gte: startDate, lte: endDate },
    },
    orderBy: { date: 'desc' },
  });
}

export async function getUserCompletionsForDate(userId: string, date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return prisma.habitCompletion.findMany({
    where: {
      userId,
      date: { gte: startOfDay, lte: endOfDay },
    },
    include: { habit: true },
  });
}

export async function isHabitCompletedOnDate(habitId: string, date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const completion = await prisma.habitCompletion.findFirst({
    where: {
      habitId,
      date: { gte: startOfDay, lte: endOfDay },
    },
  });
  return !!completion;
}

export async function isHabitCompletedToday(habitId: string) {
  return isHabitCompletedOnDate(habitId, new Date());
}

export async function completeHabit(habitId: string, userId: string, date?: Date) {
  const completionDate = date || new Date();
  completionDate.setHours(0, 0, 0, 0);

  return prisma.habitCompletion.create({
    data: {
      habitId,
      userId,
      date: completionDate,
    },
  });
}

export async function uncompleteHabit(habitId: string, date?: Date) {
  const completionDate = date || new Date();
  const startOfDay = new Date(completionDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(completionDate);
  endOfDay.setHours(23, 59, 59, 999);

  return prisma.habitCompletion.deleteMany({
    where: {
      habitId,
      date: { gte: startOfDay, lte: endOfDay },
    },
  });
}

// ============================================
// Habit Stats Functions
// ============================================

export async function getHabitStats(habitId: string): Promise<HabitStats> {
  const habit = await prisma.habit.findUnique({ where: { id: habitId } });
  if (!habit) {
    return {
      habitId,
      totalDays: 0,
      completedDays: 0,
      completionRate: 0,
      currentStreak: 0,
      longestStreak: 0,
      completionsThisWeek: 0,
      completionsThisMonth: 0,
    };
  }

  const completions = await prisma.habitCompletion.findMany({
    where: { habitId },
    orderBy: { date: 'desc' },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const startDate = new Date(habit.startDate);
  startDate.setHours(0, 0, 0, 0);

  const totalDays = Math.max(
    1,
    Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  );
  const completedDays = completions.length;
  const completionRate = Math.round((completedDays / totalDays) * 100);

  // Calculate current streak
  let currentStreak = 0;
  const checkDate = new Date(today);
  const completionDates = new Set(
    completions.map((c) => new Date(c.date).toISOString().split('T')[0])
  );

  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (completionDates.has(dateStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (checkDate.getTime() === today.getTime()) {
      // Today not completed yet, check yesterday
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate longest streak
  let longestStreak = currentStreak;
  let tempStreak = 0;
  const sortedDates = completions
    .map((c) => new Date(c.date).getTime())
    .sort((a, b) => a - b);

  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const diff = (sortedDates[i] - sortedDates[i - 1]) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }

  const completionsThisWeek = completions.filter(
    (c) => new Date(c.date) >= startOfWeek
  ).length;
  const completionsThisMonth = completions.filter(
    (c) => new Date(c.date) >= startOfMonth
  ).length;

  return {
    habitId,
    totalDays,
    completedDays,
    completionRate,
    currentStreak,
    longestStreak,
    completionsThisWeek,
    completionsThisMonth,
  };
}

// ============================================
// Challenge Functions
// ============================================

export async function getGroupChallenges(groupId: string) {
  return prisma.challenge.findMany({
    where: { groupId },
    include: { createdBy: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getActiveChallenges(groupId: string) {
  return prisma.challenge.findMany({
    where: { groupId, isActive: true },
    include: { createdBy: true },
    orderBy: { startDate: 'desc' },
  });
}

export async function getChallengeById(id: string) {
  return prisma.challenge.findUnique({
    where: { id },
    include: { createdBy: true, group: true },
  });
}

export async function createChallenge(data: {
  name: string;
  description?: string;
  groupId: string;
  createdByUserId: string;
  targetCategory?: HabitCategory;
  targetType: 'COMPLETIONS_PER_WEEK' | 'STREAK_DAYS';
  targetValue: number;
  startDate: Date;
  endDate: Date;
  rewardXp?: number;
  badgeName?: string;
}) {
  return prisma.challenge.create({
    data: {
      ...data,
      targetCategory: data.targetCategory
        ? toPrismaCategory(data.targetCategory)
        : null,
    },
  });
}

export async function updateChallenge(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    targetCategory: HabitCategory;
    targetType: 'COMPLETIONS_PER_WEEK' | 'STREAK_DAYS';
    targetValue: number;
    startDate: Date;
    endDate: Date;
    rewardXp: number;
    badgeName: string;
    isActive: boolean;
  }>
) {
  const updateData: Record<string, unknown> = { ...data };
  if (data.targetCategory) {
    updateData.targetCategory = toPrismaCategory(data.targetCategory);
  }
  return prisma.challenge.update({
    where: { id },
    data: updateData,
  });
}

// ============================================
// Challenge Participation Functions
// ============================================

export async function getUserChallengeParticipation(userId: string) {
  return prisma.challengeParticipation.findMany({
    where: { userId },
    include: { challenge: true },
  });
}

export async function getChallengeParticipants(challengeId: string) {
  const participations = await prisma.challengeParticipation.findMany({
    where: { challengeId },
    include: { user: true },
  });
  return participations.map((p) => ({
    user: p.user,
    participation: p,
  }));
}

export async function joinChallenge(challengeId: string, userId: string) {
  return prisma.challengeParticipation.create({
    data: { challengeId, userId },
  });
}

export async function updateChallengeProgress(
  challengeId: string,
  userId: string,
  progress: number,
  isCompleted?: boolean
) {
  return prisma.challengeParticipation.update({
    where: {
      challengeId_userId: { challengeId, userId },
    },
    data: {
      progress,
      isCompleted: isCompleted || false,
      completedAt: isCompleted ? new Date() : null,
    },
  });
}

// ============================================
// Student Summary (for teacher dashboard)
// ============================================

export async function getStudentSummary(studentId: string) {
  const student = await prisma.user.findUnique({ where: { id: studentId } });
  if (!student) return null;

  const habits = await getUserHabits(studentId);
  const allStats = await Promise.all(habits.map((h) => getHabitStats(h.id)));

  const avgCompletion =
    allStats.length > 0
      ? Math.round(allStats.reduce((sum, s) => sum + s.completionRate, 0) / allStats.length)
      : 0;

  const bestStreak =
    allStats.length > 0 ? Math.max(...allStats.map((s) => s.longestStreak)) : 0;

  const participations = await prisma.challengeParticipation.findMany({
    where: { userId: studentId },
    include: { challenge: true },
  });

  const activeChallengesJoined = participations.filter(
    (p) => p.challenge.isActive
  ).length;

  return {
    student,
    activeHabits: habits.length,
    recentCompletion: avgCompletion,
    bestStreak,
    challengesJoined: activeChallengesJoined,
  };
}

// ============================================
// Leaderboard Functions
// ============================================

export async function getGroupLeaderboard(groupId: string) {
  const students = await getGroupStudents(groupId);
  return students
    .map((s) => ({
      id: s.id,
      name: s.name,
      image: s.image,
      xp: s.xp,
      level: s.level,
    }))
    .sort((a, b) => b.xp - a.xp);
}
