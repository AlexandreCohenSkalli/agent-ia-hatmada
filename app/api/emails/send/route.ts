import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
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

interface SendEmailRequest {
  to: string;
  subject: string;
  body: string;
  fromName?: string;
  cc?: string[];
  bcc?: string[];
  emailId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body: SendEmailRequest = await request.json();
    const { to, subject, body: emailBody, fromName, cc, bcc, emailId } = body;

    if (!to || !subject || !emailBody) {
      return NextResponse.json({ error: 'to, subject, and body are required' }, { status: 400 });
    }

    // Get user's personal SMTP config
    const smtpConfig = await prisma.smtpConfig.findUnique({ where: { userId } });
    if (!smtpConfig) {
      return NextResponse.json(
        { error: 'Aucune configuration SMTP trouvée. Veuillez configurer votre email dans Paramètres.' },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: { user: smtpConfig.smtpUser, pass: smtpConfig.smtpPass },
    });

    const senderName = fromName || smtpConfig.fromName || 'HATMADA';
    const senderEmail = smtpConfig.senderEmail;

    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const pixelTag = emailId
      ? `<img src="${appUrl}/api/emails/track/open?id=${emailId}" width="1" height="1" style="display:block;width:1px;height:1px;" alt="" />`
      : '';

    const toHtml = (text: string) => {
      const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      const linked = escaped.replace(
        /(https?:\/\/[^\s<]+)/g,
        '<a href="$1" style="color:#2563eb;" target="_blank">$1</a>'
      );
      return `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; font-size: 15px; color: #222; line-height: 1.7; max-width: 600px; margin: 0 auto; padding: 24px;">${
        linked
          .split('\n\n')
          .map(p => `<p style="margin: 0 0 14px 0;">${p.replace(/\n/g, '<br/>')}</p>`)
          .join('')
      }${pixelTag}</body></html>`;
    };

    const htmlBody = emailBody.startsWith('<!DOCTYPE')
      ? emailBody.replace('</body>', `${pixelTag}</body>`)
      : toHtml(emailBody);

    const info = await transporter.sendMail({
      from: `"${senderName}" <${senderEmail}>`,
      to,
      cc,
      bcc,
      subject,
      html: htmlBody,
      text: emailBody.replace(/<[^>]*>/g, ''),
      messageId: emailId
        ? `<hatmada-${emailId}@${senderEmail.split('@')[1] || 'hatmada.app'}>`
        : undefined,
    });

    console.log('Email sent:', info.messageId);

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      to,
      subject,
      sentAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json({ error: 'Failed to send email', details: String(error) }, { status: 500 });
  }
}

// GET: Verify current user's SMTP connection
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const smtpConfig = await prisma.smtpConfig.findUnique({ where: { userId } });
    if (!smtpConfig) return NextResponse.json({ error: 'Aucune configuration SMTP trouvée' }, { status: 404 });

    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: { user: smtpConfig.smtpUser, pass: smtpConfig.smtpPass },
    });

    await transporter.verify();

    return NextResponse.json({
      success: true,
      message: 'SMTP connection verified',
      config: { host: smtpConfig.host, port: smtpConfig.port, senderEmail: smtpConfig.senderEmail },
    });
  } catch (error) {
    return NextResponse.json({ error: 'SMTP configuration error', details: String(error) }, { status: 500 });
  }
}
