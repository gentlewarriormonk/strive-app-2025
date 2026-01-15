import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { XP_PER_COMPLETION, STREAK_MULTIPLIERS, getLevelFromXP } from '@/types/models';

// Calculate streak multiplier based on current streak
function getStreakMultiplier(streak: number): number {
  if (streak >= 30) return STREAK_MULTIPLIERS[30];
  if (streak >= 7) return STREAK_MULTIPLIERS[7];
  if (streak >= 3) return STREAK_MULTIPLIERS[3];
  return 1.0;
}

// Calculate current streak for a habit
async function calculateCurrentStreak(habitId: string, today: Date): Promise<number> {
  const completions = await prisma.habitCompletion.findMany({
    where: { habitId },
    orderBy: { date: 'desc' },
    take: 60,
  });

  if (completions.length === 0) return 0;

  const completionDates = new Set(
    completions.map(c => {
      const d = new Date(c.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );

  let streak = 0;
  const checkDate = new Date(today);

  // Check if today is completed (it should be since we just completed it)
  if (completionDates.has(checkDate.getTime())) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Count backwards from yesterday
  while (completionDates.has(checkDate.getTime())) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
}

// POST - Mark habit as complete for today
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: habitId } = await params;

    // Verify the habit belongs to the user
    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId: session.user.id },
    });

    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already completed today (to avoid double XP)
    const existingCompletion = await prisma.habitCompletion.findUnique({
      where: {
        habitId_date: {
          habitId,
          date: today,
        },
      },
    });

    // Create completion for today
    const completion = await prisma.habitCompletion.upsert({
      where: {
        habitId_date: {
          habitId,
          date: today,
        },
      },
      update: {},
      create: {
        habitId,
        userId: session.user.id,
        date: today,
      },
    });

    // Only award XP if this is a new completion (not a re-completion)
    let xpAwarded = 0;
    let newLevel: number | undefined;

    if (!existingCompletion) {
      // Calculate current streak (including today's completion)
      const currentStreak = await calculateCurrentStreak(habitId, today);

      // Calculate XP with streak multiplier
      const multiplier = getStreakMultiplier(currentStreak);
      xpAwarded = Math.round(XP_PER_COMPLETION * multiplier);

      // Update user's XP and level
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { xp: true, level: true },
      });

      if (user) {
        const newXp = user.xp + xpAwarded;
        newLevel = getLevelFromXP(newXp);

        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            xp: newXp,
            level: newLevel,
          },
        });
      }
    }

    return NextResponse.json({
      completed: true,
      completion,
      xpAwarded,
      newLevel,
    }, { status: 200 });
  } catch (error) {
    console.error('Error completing habit:', error);
    return NextResponse.json({ error: 'Failed to complete habit' }, { status: 500 });
  }
}

// DELETE - Remove completion for today
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: habitId } = await params;

    // Verify the habit belongs to the user
    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId: session.user.id },
    });

    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Delete completion for today if it exists
    await prisma.habitCompletion.deleteMany({
      where: {
        habitId,
        date: today,
      },
    });

    return NextResponse.json({ completed: false }, { status: 200 });
  } catch (error) {
    console.error('Error uncompleting habit:', error);
    return NextResponse.json({ error: 'Failed to uncomplete habit' }, { status: 500 });
  }
}
