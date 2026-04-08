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

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 });
  }

  const { host, port, secure, smtpUser, smtpPass, fromName, senderEmail } = body;

  // If updating an existing config, password can be omitted (keep current)
  const existing = await prisma.smtpConfig.findUnique({ where: { userId } }).catch(() => null);

  if (!host || !port || !smtpUser || !senderEmail) {
    return NextResponse.json({ error: 'Champs requis manquants (host, port, smtpUser, senderEmail)' }, { status: 400 });
  }

  // Require password only on first save
  if (!existing && !smtpPass) {
    return NextResponse.json({ error: 'Mot de passe SMTP requis pour la première configuration' }, { status: 400 });
  }

  try {
    const data: any = {
      host,
      port: parseInt(String(port), 10),
      secure: !!secure,
      smtpUser,
      fromName: fromName || '',
      senderEmail,
    };
    // Only update password if a new one is provided
    if (smtpPass) data.smtpPass = smtpPass;

    const config = await prisma.smtpConfig.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data, smtpPass: smtpPass || '' },
    });

    return NextResponse.json({ success: true, configId: config.id });
  } catch (err: any) {
    console.error('[SMTP config save error]', err);
    return NextResponse.json({ error: 'Erreur lors de la sauvegarde', details: String(err?.message || err) }, { status: 500 });
  }
}

// DELETE: Remove SMTP config
export async function DELETE(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.smtpConfig.deleteMany({ where: { userId } });
  return NextResponse.json({ success: true });
}
