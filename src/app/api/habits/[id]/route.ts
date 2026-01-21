import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Update habit
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verify the habit belongs to the user
    const habit = await prisma.habit.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    if (habit.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Build update data from allowed fields
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.visibility !== undefined) updateData.visibility = body.visibility;
    if (body.scheduleFrequency !== undefined) updateData.scheduleFrequency = body.scheduleFrequency;
    if (body.scheduleDays !== undefined) updateData.scheduleDays = body.scheduleDays;
    if (body.cue !== undefined) updateData.cue = body.cue || null;
    if (body.location !== undefined) updateData.location = body.location || null;
    if (body.obstacle !== undefined) updateData.obstacle = body.obstacle || null;
    if (body.backupPlan !== undefined) updateData.backupPlan = body.backupPlan || null;

    const updatedHabit = await prisma.habit.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedHabit);
  } catch (error) {
    console.error('Error updating habit:', error);
    return NextResponse.json({ error: 'Failed to update habit' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify the habit belongs to the user
    const habit = await prisma.habit.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    if (habit.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete the habit (completions will cascade delete due to schema)
    await prisma.habit.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting habit:', error);
    return NextResponse.json({ error: 'Failed to delete habit' }, { status: 500 });
  }
}
