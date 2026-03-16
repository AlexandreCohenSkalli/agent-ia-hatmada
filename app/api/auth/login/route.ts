import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

// Hardcoded admin account (always allowed)
const ADMIN_USER = {
  id: 'admin-1',
  name: 'Admin HATMADA',
  email: 'alexcoh07@gmail.com',
  // Password: hatmada2026
  password: '$2a$10$bKcTlgkn7UqddD7LwVRvnuoF3yjGwqtzmRAu4NrzYzvFy3lbRNMgG',
  role: 'admin',
};

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Try admin account first - ONLY alexcoh07@gmail.com can be admin
    if (email === ADMIN_USER.email) {
      const passwordMatch = await bcrypt.compare(password, ADMIN_USER.password);
      if (!passwordMatch) {
        return NextResponse.json(
          { error: 'Email ou mot de passe incorrect' },
          { status: 401 }
        );
      }
      // Admin account found and password correct

      const token = jwt.sign(
        { userId: ADMIN_USER.id, email: ADMIN_USER.email, role: 'admin' },
        process.env.JWT_SECRET || 'hatmada_secret_key_2026',
        { expiresIn: '30d' }
      );

      const response = NextResponse.json({
        token,
        user: { id: ADMIN_USER.id, name: ADMIN_USER.name, email: ADMIN_USER.email, role: 'admin' },
      });
      response.cookies.set('authToken', token, { httpOnly: false, maxAge: 30 * 24 * 60 * 60 });
      return response;
    }

    // Try regular users from database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Check if user is approved
    if (!user.approved) {
      return NextResponse.json(
        { error: 'Votre compte est en attente d\'approbation par un administrateur' },
        { status: 403 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '30d' }
    );

    const response = NextResponse.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
    response.cookies.set('authToken', token, { httpOnly: false, maxAge: 30 * 24 * 60 * 60 });
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    );
  }
}
