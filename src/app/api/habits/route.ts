import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Map display category names to Prisma enum values (as strings)
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

    const habit = await prisma.habit.create({
      data: {
        userId: session.user.id,
        name,
        description: description || null,
        category: categoryEnum as any,
        visibility: visibility || 'PUBLIC_TO_CLASS',
        scheduleFrequency: scheduleFrequency || 'DAILY',
        scheduleDays: scheduleDays || [],
        startDate: startDate ? new Date(startDate) : new Date(),
        isActive: true,
      },
    });

    return NextResponse.json(habit, { status: 201 });
  } catch (error) {
    console.error('Error creating habit:', error);
    return NextResponse.json({ error: 'Failed to create habit' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const habits = await prisma.habit.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(habits);
  } catch (error) {
    console.error('Error fetching habits:', error);
    return NextResponse.json({ error: 'Failed to fetch habits' }, { status: 500 });
  }
}
