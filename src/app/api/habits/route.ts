import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Map form display names to database enum values (no spaces in DB)
const categoryMap: Record<string, string> = {
  'Sleep': 'Sleep',
  'Movement': 'Movement',
  'Focus & Study': 'FocusStudy',
  'Mindfulness & Emotion': 'MindfulnessEmotion',
  'Social & Connection': 'SocialConnection',
  'Nutrition & Hydration': 'NutritionHydration',
  'Digital Hygiene': 'DigitalHygiene',
  'Other': 'Other',
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, category, visibility, scheduleFrequency, scheduleDays, startDate } = body;

    if (!name || !category) {
      return NextResponse.json({ error: 'Name and category are required' }, { status: 400 });
    }

    // Map category string to enum value
    const categoryEnum = categoryMap[category];
    if (!categoryEnum) {
      return NextResponse.json({ error: `Invalid category: ${category}` }, { status: 400 });
    }

    // Map visibility - support both old 3-tier and new 2-tier system
    // ANONYMISED_ONLY is no longer used, map to PRIVATE_TO_PEERS (teacher only)
    let visibilityEnum = visibility || 'PUBLIC_TO_CLASS';
    if (visibilityEnum === 'ANONYMISED_ONLY') {
      visibilityEnum = 'PRIVATE_TO_PEERS';
    }

    const habit = await prisma.habit.create({
      data: {
        userId: session.user.id,
        name,
        description: description || null,
        category: categoryEnum as any, // Cast to any to allow string enum value
        visibility: visibilityEnum,
        scheduleFrequency: scheduleFrequency || 'DAILY',
        scheduleDays: scheduleDays || [],
        startDate: startDate ? new Date(startDate) : new Date(),
        isActive: true,
      },
    });

    return NextResponse.json(habit, { status: 201 });
  } catch (error) {
    console.error('Error creating habit:', error);
    // Return more specific error message for debugging
    const errorMessage = error instanceof Error ? error.message : 'Failed to create habit';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get habits with their completions
    const habits = await prisma.habit.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      include: {
        completions: {
          orderBy: { date: 'desc' },
          take: 60, // Get last 60 completions for streak calculation
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate stats for each habit
    const habitsWithStats = habits.map(habit => {
      const completionDates = habit.completions.map(c => {
        const d = new Date(c.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      });

      // Check if completed today
      const isCompletedToday = completionDates.includes(today.getTime());

      // Calculate current streak
      let currentStreak = 0;
      const checkDate = new Date(today);

      while (true) {
        const checkTime = checkDate.getTime();
        if (completionDates.includes(checkTime)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (checkTime === today.getTime()) {
          // Today not completed yet, check from yesterday
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      // Calculate completions this week
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const completionsThisWeek = completionDates.filter(t => t >= startOfWeek.getTime()).length;

      // Remove completions from response to reduce payload
      const { completions, ...habitData } = habit;

      return {
        ...habitData,
        isCompletedToday,
        currentStreak,
        completionsThisWeek,
      };
    });

    return NextResponse.json(habitsWithStats);
  } catch (error) {
    console.error('Error fetching habits:', error);
    return NextResponse.json({ error: 'Failed to fetch habits' }, { status: 500 });
  }
}
