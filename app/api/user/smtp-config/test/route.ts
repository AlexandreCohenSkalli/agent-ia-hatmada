import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

function getUserIdFromRequest(request: NextRequest): string | null {
  const token = request.cookies.get('authToken')?.value
    || request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hatmada_secret_key_2026') as any;
    return decoded.userId;
  } catch {
    return null;
  }
}

// POST: Test SMTP connection with stored config
export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const config = await prisma.smtpConfig.findUnique({ where: { userId } });
  if (!config) {
    return NextResponse.json({ error: 'Aucune configuration SMTP trouvée' }, { status: 404 });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.smtpUser, pass: config.smtpPass },
    });

    await transporter.verify();

    // Send a test email to the configured sender
    await transporter.sendMail({
      from: `"${config.fromName || 'HATMADA Test'}" <${config.senderEmail}>`,
      to: config.senderEmail,
      subject: 'Test SMTP HATMADA ✓',
      text: 'Votre configuration SMTP fonctionne correctement.',
    });

    return NextResponse.json({ success: true, message: 'Connexion SMTP vérifiée et email de test envoyé !' });
  } catch (error) {
    return NextResponse.json({ error: 'Échec de connexion SMTP', details: String(error) }, { status: 500 });
  }
}
