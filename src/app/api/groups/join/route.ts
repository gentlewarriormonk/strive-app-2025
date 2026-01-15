import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Join a group using a join code
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { joinCode } = body;

    if (!joinCode || joinCode.trim().length === 0) {
      return NextResponse.json({ error: 'Join code is required' }, { status: 400 });
    }

    // Find the group with this join code
    const group = await prisma.group.findUnique({
      where: { joinCode: joinCode.trim().toUpperCase() },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: 'Invalid join code. Please check and try again.' }, { status: 404 });
    }

    // Check if user is already a member
    const existingMembership = await prisma.groupMembership.findUnique({
      where: {
        groupId_userId: {
          groupId: group.id,
          userId: session.user.id,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json({ error: 'You are already a member of this class' }, { status: 400 });
    }

    // Create the membership
    await prisma.groupMembership.create({
      data: {
        groupId: group.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      group: {
        id: group.id,
        name: group.name,
        description: group.description,
        teacherName: group.teacher.name,
      },
    });
  } catch (error) {
    console.error('Error joining group:', error);
    return NextResponse.json({ error: 'Failed to join class' }, { status: 500 });
  }
}
