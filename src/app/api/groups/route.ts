import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Generate a unique 8-character join code
function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing characters
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// POST - Create a new group
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a teacher
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Only teachers can create groups' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description } = body;

    // Validate and sanitize name
    const trimmedName = typeof name === 'string' ? name.trim() : '';
    if (trimmedName.length === 0) {
      return NextResponse.json({ error: 'Group name is required' }, { status: 400 });
    }
    if (trimmedName.length > 100) {
      return NextResponse.json({ error: 'Group name must be 100 characters or less' }, { status: 400 });
    }

    // Validate description length
    const trimmedDescription = typeof description === 'string' ? description.trim() : null;
    if (trimmedDescription && trimmedDescription.length > 500) {
      return NextResponse.json({ error: 'Description must be 500 characters or less' }, { status: 400 });
    }

    // Get or create a default school for the teacher
    let schoolId = user.schoolId;
    if (!schoolId) {
      // Create a default school for this teacher
      const school = await prisma.school.create({
        data: {
          name: `${user.name}'s School`,
          code: `SCH-${generateJoinCode().slice(0, 6)}`,
        },
      });
      schoolId = school.id;

      // Update the teacher's school
      await prisma.user.update({
        where: { id: user.id },
        data: { schoolId },
      });
    }

    // Generate unique join code
    let joinCode = generateJoinCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.group.findUnique({
        where: { joinCode },
      });
      if (!existing) break;
      joinCode = generateJoinCode();
      attempts++;
    }

    // Create the group
    const group = await prisma.group.create({
      data: {
        name: trimmedName,
        description: trimmedDescription,
        schoolId,
        teacherId: session.user.id,
        joinCode,
      },
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
  }
}

// GET - Fetch teacher's groups
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get start of current week (Monday)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    // Get groups where user is the teacher
    const groups = await prisma.group.findMany({
      where: {
        teacherId: session.user.id,
      },
      include: {
        _count: {
          select: {
            memberships: true,
          },
        },
        memberships: {
          include: {
            user: {
              include: {
                habitCompletions: {
                  where: {
                    date: {
                      gte: monday,
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform to include member count and weekly completions
    const groupsWithStats = groups.map(group => {
      // Count completions this week from all members
      const completionsThisWeek = group.memberships.reduce((total, membership) => {
        return total + membership.user.habitCompletions.length;
      }, 0);

      // Count active students (those with at least one completion this week)
      const activeStudentsThisWeek = group.memberships.filter(
        m => m.user.habitCompletions.length > 0
      ).length;

      // Remove memberships from response to reduce payload
      const { memberships, _count, ...groupData } = group;

      return {
        ...groupData,
        memberCount: _count.memberships,
        completionsThisWeek,
        activeStudentsThisWeek,
      };
    });

    return NextResponse.json(groupsWithStats);
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 });
  }
}
