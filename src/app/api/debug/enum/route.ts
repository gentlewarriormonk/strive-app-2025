import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Diagnostic endpoint to check what enum values the database actually has
// DELETE THIS FILE after debugging is complete
export async function GET() {
  try {
    // 1. Query the PostgreSQL enum values directly
    const enumValues = await prisma.$queryRaw<Array<{ enumlabel: string }>>`
      SELECT enumlabel
      FROM pg_enum
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'HabitCategory')
      ORDER BY enumsortorder
    `;

    // 2. Get sample habits to see what category values are stored
    const sampleHabits = await prisma.habit.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
        category: true,
      },
    });

    // 3. Get distinct categories in use
    const distinctCategories = await prisma.$queryRaw<Array<{ category: string }>>`
      SELECT DISTINCT category::text FROM "Habit"
    `;

    return NextResponse.json({
      message: 'Database enum diagnostic',
      databaseEnumValues: enumValues.map(e => e.enumlabel),
      sampleHabits: sampleHabits,
      distinctCategoriesInUse: distinctCategories.map(c => c.category),
      prismaSchemaExpects: [
        'Sleep',
        'Movement',
        'FocusStudy (mapped to "Focus & Study")',
        'MindfulnessEmotion (mapped to "Mindfulness & Emotion")',
        'SocialConnection (mapped to "Social & Connection")',
        'NutritionHydration (mapped to "Nutrition & Hydration")',
        'DigitalHygiene (mapped to "Digital Hygiene")',
        'Other'
      ],
    });
  } catch (error) {
    console.error('Debug enum error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
