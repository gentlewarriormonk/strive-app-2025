import {
  User,
  School,
  Group,
  GroupMembership,
  Habit,
  HabitCompletion,
  HabitStats,
  Challenge,
  ChallengeParticipation,
} from '@/types/models';

// ============================================
// SCHOOLS
// ============================================
export const schools: School[] = [
  {
    id: 'school-1',
    name: 'REAL School Budapest',
    code: 'REAL-BP',
    createdAt: new Date('2024-01-15'),
  },
];

// ============================================
// USERS
// ============================================
export const users: User[] = [
  // Teacher
  {
    id: 'teacher-1',
    email: 'ms.davison@realschool.eu',
    name: 'Ms. Davison',
    avatarUrl: '/avatars/teacher-1.jpg',
    role: 'TEACHER',
    schoolId: 'school-1',
    xp: 1800,
    level: 15,
    createdAt: new Date('2024-01-15'),
  },
  // Students
  {
    id: 'student-1',
    email: 'alex.rivera@student.realschool.eu',
    name: 'Alex Rivera',
    avatarUrl: '/avatars/student-1.jpg',
    role: 'STUDENT',
    schoolId: 'school-1',
    xp: 1250,
    level: 8,
    createdAt: new Date('2024-02-01'),
  },
  {
    id: 'student-2',
    email: 'ben.carter@student.realschool.eu',
    name: 'Ben Carter',
    avatarUrl: '/avatars/student-2.jpg',
    role: 'STUDENT',
    schoolId: 'school-1',
    xp: 980,
    level: 7,
    createdAt: new Date('2024-02-01'),
  },
  {
    id: 'student-3',
    email: 'chloe.davis@student.realschool.eu',
    name: 'Chloe Davis',
    avatarUrl: '/avatars/student-3.jpg',
    role: 'STUDENT',
    schoolId: 'school-1',
    xp: 1450,
    level: 9,
    createdAt: new Date('2024-02-01'),
  },
  {
    id: 'student-4',
    email: 'david.evans@student.realschool.eu',
    name: 'David Evans',
    avatarUrl: '/avatars/student-4.jpg',
    role: 'STUDENT',
    schoolId: 'school-1',
    xp: 2100,
    level: 10,
    createdAt: new Date('2024-02-01'),
  },
  {
    id: 'student-5',
    email: 'emily.foster@student.realschool.eu',
    name: 'Emily Foster',
    avatarUrl: '/avatars/student-5.jpg',
    role: 'STUDENT',
    schoolId: 'school-1',
    xp: 650,
    level: 5,
    createdAt: new Date('2024-02-15'),
  },
  {
    id: 'student-6',
    email: 'fiona.garcia@student.realschool.eu',
    name: 'Fiona Garcia',
    avatarUrl: '/avatars/student-6.jpg',
    role: 'STUDENT',
    schoolId: 'school-1',
    xp: 1100,
    level: 8,
    createdAt: new Date('2024-02-01'),
  },
  {
    id: 'student-7',
    email: 'george.lee@student.realschool.eu',
    name: 'George Lee',
    avatarUrl: '/avatars/student-7.jpg',
    role: 'STUDENT',
    schoolId: 'school-1',
    xp: 1750,
    level: 7,
    createdAt: new Date('2024-02-01'),
  },
];

// Helper to get current logged-in user (mock)
export const currentStudent = users.find(u => u.id === 'student-1')!;
export const currentTeacher = users.find(u => u.id === 'teacher-1')!;

// ============================================
// GROUPS
// ============================================
export const groups: Group[] = [
  {
    id: 'group-1',
    name: 'Grade 7 Advisory',
    description: "Ms. Davison's homeroom group for the 2024-2025 school year.",
    schoolId: 'school-1',
    teacherId: 'teacher-1',
    joinCode: 'G7ADV-STRV',
    createdAt: new Date('2024-02-01'),
  },
  {
    id: 'group-2',
    name: 'Oak House',
    description: 'Inter-grade house group for Oak House students.',
    schoolId: 'school-1',
    teacherId: 'teacher-1',
    joinCode: 'OAK-STRV',
    createdAt: new Date('2024-02-01'),
  },
];

// ============================================
// GROUP MEMBERSHIPS
// ============================================
export const groupMemberships: GroupMembership[] = [
  // All students in Grade 7 Advisory
  { id: 'gm-1', groupId: 'group-1', userId: 'student-1', joinedAt: new Date('2024-02-01') },
  { id: 'gm-2', groupId: 'group-1', userId: 'student-2', joinedAt: new Date('2024-02-01') },
  { id: 'gm-3', groupId: 'group-1', userId: 'student-3', joinedAt: new Date('2024-02-01') },
  { id: 'gm-4', groupId: 'group-1', userId: 'student-4', joinedAt: new Date('2024-02-01') },
  { id: 'gm-5', groupId: 'group-1', userId: 'student-5', joinedAt: new Date('2024-02-15') },
  { id: 'gm-6', groupId: 'group-1', userId: 'student-6', joinedAt: new Date('2024-02-01') },
  { id: 'gm-7', groupId: 'group-1', userId: 'student-7', joinedAt: new Date('2024-02-01') },
  // Teacher in their groups
  { id: 'gm-8', groupId: 'group-1', userId: 'teacher-1', joinedAt: new Date('2024-02-01') },
  { id: 'gm-9', groupId: 'group-2', userId: 'teacher-1', joinedAt: new Date('2024-02-01') },
  // Some students in Oak House too
  { id: 'gm-10', groupId: 'group-2', userId: 'student-1', joinedAt: new Date('2024-02-01') },
  { id: 'gm-11', groupId: 'group-2', userId: 'student-3', joinedAt: new Date('2024-02-01') },
  { id: 'gm-12', groupId: 'group-2', userId: 'student-5', joinedAt: new Date('2024-02-15') },
];

// ============================================
// HABITS
// ============================================
export const habits: Habit[] = [
  // Alex Rivera's habits
  {
    id: 'habit-1',
    userId: 'student-1',
    name: 'Get 8 hours of sleep',
    description: 'Aim to be in bed by 10pm and wake up by 6am',
    category: 'Sleep',
    visibility: 'PUBLIC_TO_CLASS',
    scheduleFrequency: 'DAILY',
    startDate: new Date('2024-09-01'),
    isActive: true,
    createdAt: new Date('2024-09-01'),
  },
  {
    id: 'habit-2',
    userId: 'student-1',
    name: '30 minutes of physical activity',
    description: 'Any form of exercise - walking, sports, gym',
    category: 'Movement',
    visibility: 'PUBLIC_TO_CLASS',
    scheduleFrequency: 'DAILY',
    startDate: new Date('2024-09-01'),
    isActive: true,
    createdAt: new Date('2024-09-01'),
  },
  {
    id: 'habit-3',
    userId: 'student-1',
    name: 'Read for 20 minutes',
    description: 'Reading anything - books, articles, magazines',
    category: 'Focus & Study',
    visibility: 'PUBLIC_TO_CLASS',
    scheduleFrequency: 'DAILY',
    startDate: new Date('2024-09-15'),
    isActive: true,
    createdAt: new Date('2024-09-15'),
  },
  {
    id: 'habit-4',
    userId: 'student-1',
    name: 'Drink 8 glasses of water',
    category: 'Nutrition & Hydration',
    visibility: 'PUBLIC_TO_CLASS',
    scheduleFrequency: 'DAILY',
    startDate: new Date('2024-09-01'),
    isActive: true,
    createdAt: new Date('2024-09-01'),
  },
  {
    id: 'habit-5',
    userId: 'student-1',
    name: '5 minutes of meditation',
    description: 'Use the Headspace app or just sit quietly',
    category: 'Mindfulness & Emotion',
    visibility: 'PRIVATE_TO_PEERS',
    scheduleFrequency: 'DAILY',
    startDate: new Date('2024-10-01'),
    isActive: true,
    createdAt: new Date('2024-10-01'),
  },
  // Ben Carter's habits
  {
    id: 'habit-6',
    userId: 'student-2',
    name: 'Practice guitar',
    description: '15 minutes of guitar practice',
    category: 'Focus & Study',
    visibility: 'PUBLIC_TO_CLASS',
    scheduleFrequency: 'SPECIFIC_DAYS',
    scheduleDays: [1, 3, 5], // Mon, Wed, Fri
    startDate: new Date('2024-09-01'),
    isActive: true,
    createdAt: new Date('2024-09-01'),
  },
  {
    id: 'habit-7',
    userId: 'student-2',
    name: 'No screens after 9pm',
    category: 'Digital Hygiene',
    visibility: 'ANONYMISED_ONLY',
    scheduleFrequency: 'DAILY',
    startDate: new Date('2024-09-15'),
    isActive: true,
    createdAt: new Date('2024-09-15'),
  },
  // Chloe Davis's habits
  {
    id: 'habit-8',
    userId: 'student-3',
    name: 'Morning stretching routine',
    description: '10 minutes of stretching after waking up',
    category: 'Movement',
    visibility: 'PUBLIC_TO_CLASS',
    scheduleFrequency: 'DAILY',
    startDate: new Date('2024-09-01'),
    isActive: true,
    createdAt: new Date('2024-09-01'),
  },
  {
    id: 'habit-9',
    userId: 'student-3',
    name: 'Journal before bed',
    description: 'Write 3 things I am grateful for',
    category: 'Mindfulness & Emotion',
    visibility: 'PUBLIC_TO_CLASS',
    scheduleFrequency: 'DAILY',
    startDate: new Date('2024-09-01'),
    isActive: true,
    createdAt: new Date('2024-09-01'),
  },
  // David Evans's habits
  {
    id: 'habit-10',
    userId: 'student-4',
    name: 'Call a friend or family member',
    category: 'Social & Connection',
    visibility: 'PUBLIC_TO_CLASS',
    scheduleFrequency: 'WEEKLY',
    timesPerWeek: 3,
    startDate: new Date('2024-09-01'),
    isActive: true,
    createdAt: new Date('2024-09-01'),
  },
  {
    id: 'habit-11',
    userId: 'student-4',
    name: 'Complete homework before dinner',
    category: 'Focus & Study',
    visibility: 'PUBLIC_TO_CLASS',
    scheduleFrequency: 'SPECIFIC_DAYS',
    scheduleDays: [1, 2, 3, 4, 5], // Weekdays
    startDate: new Date('2024-09-01'),
    isActive: true,
    createdAt: new Date('2024-09-01'),
  },
  // Teacher's habits (shared with class)
  {
    id: 'habit-12',
    userId: 'teacher-1',
    name: 'Morning run',
    description: '3km run before school',
    category: 'Movement',
    visibility: 'PUBLIC_TO_CLASS',
    scheduleFrequency: 'SPECIFIC_DAYS',
    scheduleDays: [1, 3, 5], // Mon, Wed, Fri
    startDate: new Date('2024-09-01'),
    isActive: true,
    createdAt: new Date('2024-09-01'),
  },
  {
    id: 'habit-13',
    userId: 'teacher-1',
    name: 'Read for 30 minutes',
    category: 'Focus & Study',
    visibility: 'PUBLIC_TO_CLASS',
    scheduleFrequency: 'DAILY',
    startDate: new Date('2024-09-01'),
    isActive: true,
    createdAt: new Date('2024-09-01'),
  },
];

// ============================================
// HABIT COMPLETIONS (Recent ones for demo)
// ============================================
// Use a fixed reference date to avoid hydration mismatches
const REFERENCE_DATE = new Date('2024-11-25T12:00:00Z');

// Seeded random number generator for consistent results
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateRecentCompletions(): HabitCompletion[] {
  const completions: HabitCompletion[] = [];
  const today = new Date(REFERENCE_DATE);
  today.setHours(0, 0, 0, 0);
  let idCounter = 1;
  let seed = 12345; // Fixed seed for deterministic generation

  // User completion rates
  const userRates: Record<string, number> = {
    'student-1': 0.85,
    'student-2': 0.92,
    'student-3': 0.70,
    'student-4': 0.95,
    'student-5': 0.60,
    'student-6': 0.75,
    'student-7': 0.80,
    'teacher-1': 0.90,
  };

  // Generate completions for the last 30 days for each habit
  habits.forEach(habit => {
    for (let daysAgo = 0; daysAgo < 30; daysAgo++) {
      const date = new Date(today);
      date.setDate(date.getDate() - daysAgo);
      date.setHours(0, 0, 0, 0);

      // Skip if before habit start date
      if (date < habit.startDate) continue;

      // Use seeded random for deterministic completion
      seed++;
      const completionChance = userRates[habit.userId] || 0.7;
      if (seededRandom(seed) < completionChance) {
        completions.push({
          id: `completion-${idCounter++}`,
          habitId: habit.id,
          userId: habit.userId,
          date: date,
          createdAt: date,
        });
      }
    }
  });

  return completions;
}

export const habitCompletions: HabitCompletion[] = generateRecentCompletions();

// Export reference date for consistent "today" across the app
export const TODAY = new Date(REFERENCE_DATE);
TODAY.setHours(0, 0, 0, 0);

// ============================================
// HABIT STATS (Computed from completions)
// ============================================
export function getHabitStats(habitId: string): HabitStats {
  const habit = habits.find(h => h.id === habitId);
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

  const completions = habitCompletions
    .filter(c => c.habitId === habitId)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  // Use consistent TODAY reference
  const startOfWeek = new Date(TODAY);
  startOfWeek.setDate(TODAY.getDate() - TODAY.getDay());

  const startOfMonth = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1);

  const totalDays = Math.ceil((TODAY.getTime() - habit.startDate.getTime()) / (1000 * 60 * 60 * 24));
  const completedDays = completions.length;
  const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  // Calculate current streak
  let currentStreak = 0;
  const checkDate = new Date(TODAY);
  while (true) {
    const hasCompletion = completions.some(c => {
      const cDate = new Date(c.date);
      cDate.setHours(0, 0, 0, 0);
      return cDate.getTime() === checkDate.getTime();
    });
    if (hasCompletion) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (checkDate.getTime() === TODAY.getTime()) {
      // Today not completed yet, check yesterday
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate longest streak (simplified)
  let longestStreak = currentStreak;
  let tempStreak = 0;
  const sortedDates = completions.map(c => c.date.getTime()).sort((a, b) => a - b);
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

  const completionsThisWeek = completions.filter(c => c.date >= startOfWeek).length;
  const completionsThisMonth = completions.filter(c => c.date >= startOfMonth).length;

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
// CHALLENGES
// ============================================
export const challenges: Challenge[] = [
  {
    id: 'challenge-1',
    name: 'Mindful Mornings',
    description: 'Complete any mindfulness habit 5 times this week to earn bonus XP!',
    groupId: 'group-1',
    createdByUserId: 'teacher-1',
    targetCategory: 'Mindfulness & Emotion',
    targetType: 'COMPLETIONS_PER_WEEK',
    targetValue: 5,
    startDate: new Date('2024-11-18'),
    endDate: new Date('2024-11-24'),
    rewardXp: 50,
    badgeName: 'Mindful Starter',
    isActive: true,
    createdAt: new Date('2024-11-17'),
  },
  {
    id: 'challenge-2',
    name: '5-Day Movement Streak',
    description: 'Build a 5-day streak on any movement habit',
    groupId: 'group-1',
    createdByUserId: 'teacher-1',
    targetCategory: 'Movement',
    targetType: 'STREAK_DAYS',
    targetValue: 5,
    startDate: new Date('2024-11-18'),
    endDate: new Date('2024-11-30'),
    rewardXp: 75,
    badgeName: 'Movement Champion',
    isActive: true,
    createdAt: new Date('2024-11-17'),
  },
  {
    id: 'challenge-3',
    name: 'Hydration Hero',
    description: 'Track water intake every day for a week',
    groupId: 'group-1',
    createdByUserId: 'teacher-1',
    targetCategory: 'Nutrition & Hydration',
    targetType: 'STREAK_DAYS',
    targetValue: 7,
    startDate: new Date('2024-11-11'),
    endDate: new Date('2024-11-17'),
    rewardXp: 100,
    isActive: false,
    createdAt: new Date('2024-11-10'),
  },
];

// ============================================
// CHALLENGE PARTICIPATIONS
// ============================================
export const challengeParticipations: ChallengeParticipation[] = [
  // Mindful Mornings participants
  {
    id: 'cp-1',
    challengeId: 'challenge-1',
    userId: 'student-1',
    progress: 3,
    isCompleted: false,
    joinedAt: new Date('2024-11-18'),
  },
  {
    id: 'cp-2',
    challengeId: 'challenge-1',
    userId: 'student-3',
    progress: 5,
    isCompleted: true,
    completedAt: new Date('2024-11-22'),
    joinedAt: new Date('2024-11-18'),
  },
  {
    id: 'cp-3',
    challengeId: 'challenge-1',
    userId: 'student-4',
    progress: 4,
    isCompleted: false,
    joinedAt: new Date('2024-11-19'),
  },
  // 5-Day Movement Streak participants
  {
    id: 'cp-4',
    challengeId: 'challenge-2',
    userId: 'student-1',
    progress: 4,
    isCompleted: false,
    joinedAt: new Date('2024-11-18'),
  },
  {
    id: 'cp-5',
    challengeId: 'challenge-2',
    userId: 'student-2',
    progress: 5,
    isCompleted: true,
    completedAt: new Date('2024-11-23'),
    joinedAt: new Date('2024-11-18'),
  },
  {
    id: 'cp-6',
    challengeId: 'challenge-2',
    userId: 'student-6',
    progress: 2,
    isCompleted: false,
    joinedAt: new Date('2024-11-20'),
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getUserById(id: string): User | undefined {
  return users.find(u => u.id === id);
}

export function getGroupById(id: string): Group | undefined {
  return groups.find(g => g.id === id);
}

export function getGroupMembers(groupId: string): User[] {
  const memberIds = groupMemberships
    .filter(gm => gm.groupId === groupId)
    .map(gm => gm.userId);
  return users.filter(u => memberIds.includes(u.id));
}

export function getGroupStudents(groupId: string): User[] {
  return getGroupMembers(groupId).filter(u => u.role === 'STUDENT');
}

export function getUserHabits(userId: string): Habit[] {
  return habits.filter(h => h.userId === userId && h.isActive);
}

export function getUserPublicHabits(userId: string): Habit[] {
  return habits.filter(
    h => h.userId === userId && h.isActive && h.visibility === 'PUBLIC_TO_CLASS'
  );
}

export function getGroupChallenges(groupId: string): Challenge[] {
  return challenges.filter(c => c.groupId === groupId);
}

export function getActiveChallenges(groupId: string): Challenge[] {
  return challenges.filter(c => c.groupId === groupId && c.isActive);
}

export function getUserChallengeParticipation(userId: string): ChallengeParticipation[] {
  return challengeParticipations.filter(cp => cp.userId === userId);
}

export function getChallengeParticipants(challengeId: string): { user: User; participation: ChallengeParticipation }[] {
  return challengeParticipations
    .filter(cp => cp.challengeId === challengeId)
    .map(cp => ({
      user: getUserById(cp.userId)!,
      participation: cp,
    }))
    .filter(item => item.user);
}

// Get student summary for teacher dashboard
export function getStudentSummary(studentId: string) {
  const student = getUserById(studentId);
  if (!student) return null;

  const studentHabits = getUserHabits(studentId);
  const allStats = studentHabits.map(h => getHabitStats(h.id));

  const avgCompletion = allStats.length > 0
    ? Math.round(allStats.reduce((sum, s) => sum + s.completionRate, 0) / allStats.length)
    : 0;

  const bestStreak = allStats.length > 0
    ? Math.max(...allStats.map(s => s.longestStreak))
    : 0;

  const participations = getUserChallengeParticipation(studentId);
  const activeChallengesJoined = participations.filter(p => {
    const challenge = challenges.find(c => c.id === p.challengeId);
    return challenge?.isActive;
  }).length;

  return {
    student,
    activeHabits: studentHabits.length,
    recentCompletion: avgCompletion,
    bestStreak,
    challengesJoined: activeChallengesJoined,
  };
}

// Check if a habit was completed today
export function isHabitCompletedToday(habitId: string): boolean {
  return habitCompletions.some(c => {
    const cDate = new Date(c.date);
    cDate.setHours(0, 0, 0, 0);
    return c.habitId === habitId && cDate.getTime() === TODAY.getTime();
  });
}

