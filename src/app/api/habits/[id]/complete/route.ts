import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    // Create or update completion for today
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

    return NextResponse.json({ completed: true, completion }, { status: 200 });
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
