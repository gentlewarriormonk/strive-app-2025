import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch teacher note for a student
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a teacher
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Only teachers can access notes' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    const note = await prisma.teacherNote.findUnique({
      where: {
        teacherId_studentId: {
          teacherId: session.user.id,
          studentId,
        },
      },
    });

    return NextResponse.json({ note: note?.noteText || '' });
  } catch (error) {
    console.error('Error fetching teacher note:', error);
    return NextResponse.json({ error: 'Failed to fetch note' }, { status: 500 });
  }
}

// POST - Create or update teacher note for a student
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a teacher
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Only teachers can create notes' }, { status: 403 });
    }

    const body = await request.json();
    const { studentId, groupId, noteText } = body;

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    // Upsert the note
    const note = await prisma.teacherNote.upsert({
      where: {
        teacherId_studentId: {
          teacherId: session.user.id,
          studentId,
        },
      },
      update: {
        noteText: noteText || '',
        groupId: groupId || null,
        updatedAt: new Date(),
      },
      create: {
        teacherId: session.user.id,
        studentId,
        groupId: groupId || null,
        noteText: noteText || '',
      },
    });

    return NextResponse.json({ success: true, note });
  } catch (error) {
    console.error('Error saving teacher note:', error);
    return NextResponse.json({ error: 'Failed to save note' }, { status: 500 });
  }
}
