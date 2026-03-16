import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: List all users (pending and approved)
export async function GET(request: NextRequest) {
  try {
    // Simple auth check - in production, verify JWT
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.includes('admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        approved: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Error fetching users' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PATCH: Approve a user
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.includes('admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, approved } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { approved },
      select: {
        id: true,
        name: true,
        email: true,
        approved: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: approved ? 'Utilisateur approuvé' : 'Approbation révoquée',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Error updating user' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE: Remove a user
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.includes('admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true, message: 'Utilisateur supprimé' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Error deleting user' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
