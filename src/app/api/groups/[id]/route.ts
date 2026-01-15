import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch a single group with its members
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: groupId } = await params;

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                xp: true,
                level: true,
              },
            },
          },
          orderBy: {
            joinedAt: 'desc',
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Verify user is the teacher of this group
    if (group.teacherId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized to view this group' }, { status: 403 });
    }

    // Extract students from memberships (filter out teachers)
    const students = group.memberships
      .filter(m => m.user.role === 'STUDENT')
      .map(m => ({
        ...m.user,
        joinedAt: m.joinedAt,
      }));

    return NextResponse.json({
      ...group,
      students,
      memberCount: students.length,
    });
  } catch (error) {
    console.error('Error fetching group:', error);
    return NextResponse.json({ error: 'Failed to fetch group' }, { status: 500 });
  }
}
