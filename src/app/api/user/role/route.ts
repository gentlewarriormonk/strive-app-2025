import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { role } = body;

    if (!role || !['STUDENT', 'TEACHER'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { role },
    });

    return NextResponse.json({
      success: true,
      role: updatedUser.role
    });
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        groupMemberships: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // User needs onboarding if they're a STUDENT with no group memberships
    // (new users default to STUDENT role)
    const needsOnboarding = user.role === 'STUDENT' && user.groupMemberships.length === 0;

    return NextResponse.json({
      role: user.role,
      needsOnboarding,
    });
  } catch (error) {
    console.error('Error fetching user role:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
