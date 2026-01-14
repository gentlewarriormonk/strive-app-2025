import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create school
  const school = await prisma.school.upsert({
    where: { code: 'REAL-BP' },
    update: {},
    create: {
      name: 'REAL School Budapest',
      code: 'REAL-BP',
    },
  });
  console.log('Created school:', school.name);

  // Create teacher
  const teacher = await prisma.user.upsert({
    where: { email: 'ms.davison@realschool.eu' },
    update: {},
    create: {
      email: 'ms.davison@realschool.eu',
      name: 'Ms. Davison',
      image: '/avatars/teacher-1.jpg',
      role: 'TEACHER',
      schoolId: school.id,
      xp: 1800,
      level: 15,
    },
  });
  console.log('Created teacher:', teacher.name);

  // Create students
  const studentData = [
    { email: 'alex.rivera@student.realschool.eu', name: 'Alex Rivera', xp: 1250, level: 8 },
    { email: 'ben.carter@student.realschool.eu', name: 'Ben Carter', xp: 980, level: 7 },
    { email: 'chloe.davis@student.realschool.eu', name: 'Chloe Davis', xp: 1450, level: 9 },
    { email: 'david.evans@student.realschool.eu', name: 'David Evans', xp: 2100, level: 10 },
    { email: 'emily.foster@student.realschool.eu', name: 'Emily Foster', xp: 650, level: 5 },
    { email: 'fiona.garcia@student.realschool.eu', name: 'Fiona Garcia', xp: 1100, level: 8 },
    { email: 'george.lee@student.realschool.eu', name: 'George Lee', xp: 1750, level: 7 },
  ];

  const students = await Promise.all(
    studentData.map((s, i) =>
      prisma.user.upsert({
        where: { email: s.email },
        update: {},
        create: {
          email: s.email,
          name: s.name,
          image: `/avatars/student-${i + 1}.jpg`,
          role: 'STUDENT',
          schoolId: school.id,
          xp: s.xp,
          level: s.level,
        },
      })
    )
  );
  console.log('Created', students.length, 'students');

  // Create groups
  const group1 = await prisma.group.upsert({
    where: { joinCode: 'G7ADV-STRV' },
    update: {},
    create: {
      name: 'Grade 7 Advisory',
      description: "Ms. Davison's homeroom group for the 2024-2025 school year.",
      schoolId: school.id,
      teacherId: teacher.id,
      joinCode: 'G7ADV-STRV',
    },
  });

  const group2 = await prisma.group.upsert({
    where: { joinCode: 'OAK-STRV' },
    update: {},
    create: {
      name: 'Oak House',
      description: 'Inter-grade house group for Oak House students.',
      schoolId: school.id,
      teacherId: teacher.id,
      joinCode: 'OAK-STRV',
    },
  });
  console.log('Created groups:', group1.name, ',', group2.name);

  // Add all students to Group 1
  for (const student of students) {
    await prisma.groupMembership.upsert({
      where: { groupId_userId: { groupId: group1.id, userId: student.id } },
      update: {},
      create: { groupId: group1.id, userId: student.id },
    });
  }
  // Add teacher to groups
  await prisma.groupMembership.upsert({
    where: { groupId_userId: { groupId: group1.id, userId: teacher.id } },
    update: {},
    create: { groupId: group1.id, userId: teacher.id },
  });
  await prisma.groupMembership.upsert({
    where: { groupId_userId: { groupId: group2.id, userId: teacher.id } },
    update: {},
    create: { groupId: group2.id, userId: teacher.id },
  });
  // Add some students to Group 2 (Oak House)
  const oakHouseStudents = [students[0], students[2], students[4]]; // Alex, Chloe, Emily
  for (const student of oakHouseStudents) {
    await prisma.groupMembership.upsert({
      where: { groupId_userId: { groupId: group2.id, userId: student.id } },
      update: {},
      create: { groupId: group2.id, userId: student.id },
    });
  }
  console.log('Created group memberships');

  // Create habits for Alex Rivera (first student)
  const alex = students[0];
  const alexHabits = [
    { name: 'Get 8 hours of sleep', description: 'Aim to be in bed by 10pm and wake up by 6am', category: 'Sleep' as const },
    { name: '30 minutes of physical activity', description: 'Any form of exercise - walking, sports, gym', category: 'Movement' as const },
    { name: 'Read for 20 minutes', description: 'Reading anything - books, articles, magazines', category: 'FocusStudy' as const },
    { name: 'Drink 8 glasses of water', category: 'NutritionHydration' as const },
    { name: '5 minutes of meditation', description: 'Use the Headspace app or just sit quietly', category: 'MindfulnessEmotion' as const, visibility: 'PRIVATE_TO_PEERS' as const },
  ];

  for (const habit of alexHabits) {
    await prisma.habit.upsert({
      where: { id: `seed-habit-${alex.id}-${habit.name.substring(0, 20)}` },
      update: {},
      create: {
        id: `seed-habit-${alex.id}-${habit.name.substring(0, 20)}`,
        userId: alex.id,
        name: habit.name,
        description: habit.description,
        category: habit.category,
        visibility: habit.visibility || 'PUBLIC_TO_CLASS',
        scheduleFrequency: 'DAILY',
        scheduleDays: [],
        startDate: new Date('2024-09-01'),
      },
    });
  }
  console.log('Created habits for Alex');

  // Create habits for other students
  const benHabits = [
    { name: 'Practice guitar', description: '15 minutes of guitar practice', category: 'FocusStudy' as const, days: [1, 3, 5] },
    { name: 'No screens after 9pm', category: 'DigitalHygiene' as const, visibility: 'ANONYMISED_ONLY' as const },
  ];
  const ben = students[1];
  for (const habit of benHabits) {
    await prisma.habit.upsert({
      where: { id: `seed-habit-${ben.id}-${habit.name.substring(0, 20)}` },
      update: {},
      create: {
        id: `seed-habit-${ben.id}-${habit.name.substring(0, 20)}`,
        userId: ben.id,
        name: habit.name,
        description: habit.description,
        category: habit.category,
        visibility: habit.visibility || 'PUBLIC_TO_CLASS',
        scheduleFrequency: habit.days ? 'SPECIFIC_DAYS' : 'DAILY',
        scheduleDays: habit.days || [],
      },
    });
  }

  // Create challenges
  const challenge1 = await prisma.challenge.upsert({
    where: { id: 'seed-challenge-1' },
    update: {},
    create: {
      id: 'seed-challenge-1',
      name: 'Mindful Mornings',
      description: 'Complete any mindfulness habit 5 times this week to earn bonus XP!',
      groupId: group1.id,
      createdByUserId: teacher.id,
      targetCategory: 'MindfulnessEmotion',
      targetType: 'COMPLETIONS_PER_WEEK',
      targetValue: 5,
      startDate: new Date('2024-11-18'),
      endDate: new Date('2024-11-24'),
      rewardXp: 50,
      badgeName: 'Mindful Starter',
      isActive: true,
    },
  });

  const challenge2 = await prisma.challenge.upsert({
    where: { id: 'seed-challenge-2' },
    update: {},
    create: {
      id: 'seed-challenge-2',
      name: '5-Day Movement Streak',
      description: 'Build a 5-day streak on any movement habit',
      groupId: group1.id,
      createdByUserId: teacher.id,
      targetCategory: 'Movement',
      targetType: 'STREAK_DAYS',
      targetValue: 5,
      startDate: new Date('2024-11-18'),
      endDate: new Date('2024-11-30'),
      rewardXp: 75,
      badgeName: 'Movement Champion',
      isActive: true,
    },
  });
  console.log('Created challenges');

  // Create some challenge participations
  await prisma.challengeParticipation.upsert({
    where: { challengeId_userId: { challengeId: challenge1.id, userId: alex.id } },
    update: {},
    create: {
      challengeId: challenge1.id,
      userId: alex.id,
      progress: 3,
      isCompleted: false,
    },
  });
  await prisma.challengeParticipation.upsert({
    where: { challengeId_userId: { challengeId: challenge2.id, userId: alex.id } },
    update: {},
    create: {
      challengeId: challenge2.id,
      userId: alex.id,
      progress: 4,
      isCompleted: false,
    },
  });
  console.log('Created challenge participations');

  // Create some habit completions for the last 30 days
  const habits = await prisma.habit.findMany({ where: { userId: alex.id } });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const habit of habits) {
    // Create completions for roughly 80% of the days
    for (let daysAgo = 0; daysAgo < 30; daysAgo++) {
      if (Math.random() < 0.8) {
        const date = new Date(today);
        date.setDate(date.getDate() - daysAgo);
        date.setHours(0, 0, 0, 0);

        await prisma.habitCompletion.upsert({
          where: { habitId_date: { habitId: habit.id, date } },
          update: {},
          create: {
            habitId: habit.id,
            userId: alex.id,
            date,
          },
        });
      }
    }
  }
  console.log('Created habit completions');

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
