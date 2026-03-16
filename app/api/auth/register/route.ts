import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

// Setup email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

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

    // Send notification email to admin
    try {
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL || 'alexcoh07@gmail.com',
        to: 'alexcoh07@gmail.com',
        subject: `Nouvelle demande d'inscription - ${name}`,
        html: `
          <h2>Nouvelle demande d'inscription</h2>
          <p><strong>Nom :</strong> ${name}</p>
          <p><strong>Email :</strong> ${email}</p>
          <p><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
          <br>
          <p>Veuillez vous connecter à l'admin pour approver ou rejeter cette demande.</p>
          <p><a href="${process.env.APP_URL || 'http://localhost:3000'}/login">Aller à l'admin</a></p>
        `,
      });
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
      // Don't fail the whole request if email fails
    }

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
