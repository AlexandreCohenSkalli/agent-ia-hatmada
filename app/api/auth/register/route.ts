import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock database - In production, use Prisma
const users: any[] = [];

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

    // Check if user exists (mock check)
    const userExists = users.some(u => u.email === email);
    if (userExists) {
      return NextResponse.json(
        { error: 'Cet email est déjà enregistré' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (mock)
    const user = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    };

    users.push(user);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '30d' }
    );

    return NextResponse.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  }
}
