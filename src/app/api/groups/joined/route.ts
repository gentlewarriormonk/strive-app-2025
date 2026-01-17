import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch groups the current user has joined
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all groups the user is a member of
    const memberships = await prisma.groupMembership.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        group: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
              },
            },
            _count: {
              select: {
                memberships: true,
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });

    const groups = memberships.map(m => ({
      id: m.group.id,
      name: m.group.name,
      description: m.group.description,
      teacherName: m.group.teacher.name,
      memberCount: m.group._count.memberships,
      joinedAt: m.joinedAt,
    }));

    return NextResponse.json(groups);
  } catch (error) {
    console.error('Error fetching joined groups:', error);
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 });
  }
}
