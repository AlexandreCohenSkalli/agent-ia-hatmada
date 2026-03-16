import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, nom et mot de passe requis' },
        { status: 400 }
      );
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      return NextResponse.json(
        { error: 'Cet email est déjà enregistré' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (NOT approved by default)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        approved: false,  // new users need admin approval
      },
    });

    // Return success but note that approval is required
    return NextResponse.json({
      success: true,
      message: 'Inscription réussie ! En attente d\'approbation par un administrateur.',
      userId: user.id,
      email: user.email,
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
