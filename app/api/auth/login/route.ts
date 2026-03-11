import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Hardcoded admin account (no database needed)
const ADMIN_USER = {
  id: 'admin-1',
  name: 'Admin HATMADA',
  email: 'admin@hatmada.com',
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

    // Check against hardcoded admin
    if (email !== ADMIN_USER.email) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, ADMIN_USER.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { userId: ADMIN_USER.id, email: ADMIN_USER.email, role: ADMIN_USER.role },
      process.env.JWT_SECRET || 'hatmada_secret_key_2026',
      { expiresIn: '30d' }
    );

    return NextResponse.json({
      token,
      user: { id: ADMIN_USER.id, name: ADMIN_USER.name, email: ADMIN_USER.email },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    );
  }
}
