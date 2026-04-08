import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
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

// GET: Retrieve current user's SMTP config (password masked)
export async function GET(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const config = await prisma.smtpConfig.findUnique({ where: { userId } });
  if (!config) return NextResponse.json({ config: null });

  return NextResponse.json({
    config: {
      host: config.host,
      port: config.port,
      secure: config.secure,
      smtpUser: config.smtpUser,
      smtpPass: '••••••••', // masked
      fromName: config.fromName,
      senderEmail: config.senderEmail,
    },
  });
}

// POST: Save or update current user's SMTP config
export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { host, port, secure, smtpUser, smtpPass, fromName, senderEmail } = await request.json();

  if (!host || !port || !smtpUser || !smtpPass || !senderEmail) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
  }

  const config = await prisma.smtpConfig.upsert({
    where: { userId },
    update: { host, port: parseInt(port), secure: !!secure, smtpUser, smtpPass, fromName, senderEmail },
    create: { userId, host, port: parseInt(port), secure: !!secure, smtpUser, smtpPass, fromName, senderEmail },
  });

  return NextResponse.json({ success: true, configId: config.id });
}

// DELETE: Remove SMTP config
export async function DELETE(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.smtpConfig.deleteMany({ where: { userId } });
  return NextResponse.json({ success: true });
}
