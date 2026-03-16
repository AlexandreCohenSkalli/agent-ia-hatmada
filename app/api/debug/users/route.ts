import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DEBUG ONLY - List all users with all fields
export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ 
      total: users.length,
      users: users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        approved: u.approved,
        createdAt: u.createdAt,
      }))
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
