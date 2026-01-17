/**
 * Seed script for demo data
 *
 * Creates realistic demo data for screenshots and testing:
 * - Demo user with 5 habits
 * - 14 days of completion history
 * - Level 3 XP (350-450)
 * - User in a group with another member
 *
 * Run with: npx ts-node scripts/seed-demo-data.ts
 */

import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';

const prisma = new PrismaClient();

// Helper to prompt for confirmation
async function confirm(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${message} (y/n): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

// Helper to generate random completion based on target percentage
function shouldComplete(targetPercentage: number): boolean {
  return Math.random() * 100 < targetPercentage;
}

// Helper to get date for N days ago
function daysAgo(n: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - n);
  date.setHours(12, 0, 0, 0); // Noon to avoid timezone issues
  return date;
}

// Check if a day should have completion for a specific habit schedule
function isScheduledDay(daysAgo: number, schedule: 'daily' | 'mon-wed-fri' | 'weekly'): boolean {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

  switch (schedule) {
    case 'daily':
      return true;
    case 'mon-wed-fri':
      return dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5;
    case 'weekly':
      return dayOfWeek === 1; // Mondays only
    default:
      return true;
  }
}

async function seedDemoData() {
  console.log('\n=== Strive Demo Data Seeder ===\n');

  // Check for existing demo data
  const existingDemoUser = await prisma.user.findFirst({
    where: { email: 'demo@strive.app' },
  });

  if (existingDemoUser) {
    console.log('Found existing demo user. This will delete and recreate all demo data.');
  }

  const confirmed = await confirm('This will create/reset demo data. Continue?');
  if (!confirmed) {
    console.log('Aborted.');
    process.exit(0);
  }

  console.log('\nSeeding demo data...\n');

  // Clean up existing demo data
  if (existingDemoUser) {
    console.log('Cleaning up existing demo data...');
    await prisma.habitCompletion.deleteMany({
      where: { habit: { userId: existingDemoUser.id } },
    });
    await prisma.habit.deleteMany({
      where: { userId: existingDemoUser.id },
    });
    await prisma.groupMembership.deleteMany({
      where: { userId: existingDemoUser.id },
    });
    await prisma.user.delete({
      where: { id: existingDemoUser.id },
    });
  }

  // Also clean up demo group member if exists
  const existingDemoMember = await prisma.user.findFirst({
    where: { email: 'alex.demo@strive.app' },
  });
  if (existingDemoMember) {
    await prisma.habitCompletion.deleteMany({
      where: { habit: { userId: existingDemoMember.id } },
    });
    await prisma.habit.deleteMany({
      where: { userId: existingDemoMember.id },
    });
    await prisma.groupMembership.deleteMany({
      where: { userId: existingDemoMember.id },
    });
    await prisma.user.delete({
      where: { id: existingDemoMember.id },
    });
  }

  // Clean up demo group if exists
  const existingDemoGroup = await prisma.group.findFirst({
    where: { joinCode: 'DEMO1234' },
  });
  if (existingDemoGroup) {
    await prisma.groupMembership.deleteMany({
      where: { groupId: existingDemoGroup.id },
    });
    await prisma.group.delete({
      where: { id: existingDemoGroup.id },
    });
  }

  // 1. Create demo user (Level 3, ~400 XP)
  console.log('Creating demo user...');
  const demoUser = await prisma.user.create({
    data: {
      name: 'Jordan Demo',
      email: 'demo@strive.app',
      role: 'STUDENT',
      xp: 420,
      level: 3,
    },
  });
  console.log(`  Created user: ${demoUser.name} (Level ${demoUser.level}, ${demoUser.xp} XP)`);

  // 2. Find or create a school for the demo group
  console.log('Finding or creating demo school...');
  let demoSchool = await prisma.school.findFirst();

  if (!demoSchool) {
    demoSchool = await prisma.school.create({
      data: {
        name: 'Demo School',
        code: 'DEMO' + Math.random().toString(36).substring(2, 6).toUpperCase(),
      },
    });
    console.log(`  Created school: ${demoSchool.name}`);
  } else {
    console.log(`  Using existing school: ${demoSchool.name}`);
  }

  // 3. Create demo group leader (teacher)
  console.log('Creating demo group leader...');
  const demoTeacher = await prisma.user.findFirst({
    where: { role: 'TEACHER' },
  });

  let groupTeacherId: string;
  if (demoTeacher) {
    groupTeacherId = demoTeacher.id;
    console.log(`  Using existing teacher: ${demoTeacher.name}`);
  } else {
    const newTeacher = await prisma.user.create({
      data: {
        name: 'Coach Williams',
        email: 'coach.demo@strive.app',
        role: 'TEACHER',
        xp: 850,
        level: 5,
      },
    });
    groupTeacherId = newTeacher.id;
    console.log(`  Created teacher: ${newTeacher.name}`);
  }

  // 4. Create demo group
  console.log('Creating demo group...');
  const demoGroup = await prisma.group.create({
    data: {
      name: 'Morning Wellness Group',
      description: 'A group focused on building healthy morning routines',
      joinCode: 'DEMO1234',
      teacherId: groupTeacherId,
      schoolId: demoSchool.id,
    },
  });
  console.log(`  Created group: ${demoGroup.name} (Code: ${demoGroup.joinCode})`);

  // 5. Create another group member
  console.log('Creating demo group member...');
  const demoMember = await prisma.user.create({
    data: {
      name: 'Alex Chen',
      email: 'alex.demo@strive.app',
      role: 'STUDENT',
      xp: 280,
      level: 2,
    },
  });
  console.log(`  Created member: ${demoMember.name}`);

  // 5. Add users to group
  console.log('Adding users to group...');
  await prisma.groupMembership.createMany({
    data: [
      { userId: demoUser.id, groupId: demoGroup.id },
      { userId: demoMember.id, groupId: demoGroup.id },
    ],
  });
  console.log('  Added 2 members to group');

  // 6. Create habits for demo user
  console.log('\nCreating habits for demo user...');

  const habitsConfig = [
    {
      name: 'Morning meditation',
      category: 'MindfulnessEmotion',
      targetPercentage: 85,
      schedule: 'daily' as const,
      currentStreak: 5,
      visibility: 'public',
    },
    {
      name: 'Read for 20 minutes',
      category: 'FocusStudy',
      targetPercentage: 70,
      schedule: 'daily' as const,
      currentStreak: 3,
      visibility: 'public',
    },
    {
      name: 'Go for a run',
      category: 'Movement',
      targetPercentage: 80,
      schedule: 'mon-wed-fri' as const,
      currentStreak: 2,
      visibility: 'public',
    },
    {
      name: 'No screens after 9pm',
      category: 'DigitalHygiene',
      targetPercentage: 60,
      schedule: 'daily' as const,
      currentStreak: 0, // Broken yesterday
      visibility: 'teacher_only',
    },
    {
      name: 'Call a friend',
      category: 'SocialConnection',
      targetPercentage: 100,
      schedule: 'weekly' as const,
      currentStreak: 2,
      visibility: 'public',
    },
  ];

  for (const habitConfig of habitsConfig) {
    const habit = await prisma.habit.create({
      data: {
        name: habitConfig.name,
        category: habitConfig.category as any,
        frequency: habitConfig.schedule === 'daily' ? 'Daily' :
                   habitConfig.schedule === 'weekly' ? 'Weekly' : 'Custom',
        visibility: habitConfig.visibility as any,
        userId: demoUser.id,
      },
    });
    console.log(`  Created habit: ${habit.name}`);

    // Generate 14 days of completion history
    const completions: { habitId: string; completedAt: Date }[] = [];
    let streak = 0;

    // Work backwards from today to generate realistic completion patterns
    for (let day = 13; day >= 0; day--) {
      // Skip non-scheduled days
      if (!isScheduledDay(day, habitConfig.schedule)) {
        continue;
      }

      // Determine if this day should be completed
      let shouldBeCompleted = shouldComplete(habitConfig.targetPercentage);

      // Special handling for streaks
      // For the most recent days, ensure we match the expected current streak
      if (day < habitConfig.currentStreak) {
        shouldBeCompleted = true;
      } else if (day === habitConfig.currentStreak && habitConfig.currentStreak > 0) {
        // The day before the streak started should be missed
        shouldBeCompleted = false;
      }

      // Special case: "No screens after 9pm" - broken yesterday
      if (habitConfig.name === 'No screens after 9pm' && day === 1) {
        shouldBeCompleted = false;
      }

      if (shouldBeCompleted) {
        completions.push({
          habitId: habit.id,
          completedAt: daysAgo(day),
        });
        streak++;
      } else {
        streak = 0;
      }
    }

    // Create completions
    if (completions.length > 0) {
      await prisma.habitCompletion.createMany({
        data: completions,
      });
      console.log(`    Added ${completions.length} completions (14-day history)`);
    }
  }

  // 7. Create a few habits for the other group member
  console.log('\nCreating habits for group member...');
  const memberHabits = [
    { name: 'Morning stretches', category: 'Movement' },
    { name: 'Journal before bed', category: 'MindfulnessEmotion' },
  ];

  for (const h of memberHabits) {
    const habit = await prisma.habit.create({
      data: {
        name: h.name,
        category: h.category as any,
        frequency: 'Daily',
        visibility: 'public',
        userId: demoMember.id,
      },
    });

    // Add some random completions
    const completions = [];
    for (let day = 0; day < 10; day++) {
      if (shouldComplete(65)) {
        completions.push({
          habitId: habit.id,
          completedAt: daysAgo(day),
        });
      }
    }
    if (completions.length > 0) {
      await prisma.habitCompletion.createMany({ data: completions });
    }
    console.log(`  Created habit: ${habit.name} (${completions.length} completions)`);
  }

  console.log('\n=== Demo Data Seeding Complete ===\n');
  console.log('Summary:');
  console.log(`  Demo User: ${demoUser.name} (${demoUser.email})`);
  console.log(`  XP: ${demoUser.xp}, Level: ${demoUser.level}`);
  console.log(`  Habits: ${habitsConfig.length}`);
  console.log(`  Group: ${demoGroup.name} (Join code: ${demoGroup.joinCode})`);
  console.log(`  Group Members: 2 (Jordan Demo, Alex Chen)`);
  console.log('\nNote: To login as the demo user, you\'ll need to set up');
  console.log('OAuth with an account using demo@strive.app or update');
  console.log('the email to match your Google account.\n');
}

// Run the seed
seedDemoData()
  .catch((error) => {
    console.error('Error seeding demo data:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
