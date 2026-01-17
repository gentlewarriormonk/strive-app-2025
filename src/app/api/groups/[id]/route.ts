import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch a single group with its members
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

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

// PATCH - Update a group (name, description)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: groupId } = await params;
    const body = await request.json();
    const { name, description } = body;

    // Verify group exists and user is the teacher
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { teacherId: true },
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    if (group.teacherId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized to update this group' }, { status: 403 });
    }

    // Validate and sanitize name
    let trimmedName: string | undefined;
    if (name !== undefined) {
      trimmedName = typeof name === 'string' ? name.trim() : '';
      if (trimmedName.length === 0) {
        return NextResponse.json({ error: 'Group name cannot be empty' }, { status: 400 });
      }
      if (trimmedName.length > 100) {
        return NextResponse.json({ error: 'Group name must be 100 characters or less' }, { status: 400 });
      }
    }

    // Validate description length
    let trimmedDescription: string | null | undefined;
    if (description !== undefined) {
      trimmedDescription = typeof description === 'string' ? description.trim() : null;
      if (trimmedDescription && trimmedDescription.length > 500) {
        return NextResponse.json({ error: 'Description must be 500 characters or less' }, { status: 400 });
      }
    }

    // Update the group
    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: {
        ...(trimmedName !== undefined && { name: trimmedName }),
        ...(trimmedDescription !== undefined && { description: trimmedDescription || null }),
      },
    });

    return NextResponse.json(updatedGroup);
  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json({ error: 'Failed to update group' }, { status: 500 });
  }
}
