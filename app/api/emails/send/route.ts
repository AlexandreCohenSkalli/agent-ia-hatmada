import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer'; // Will need to add this to package.json

interface SendEmailRequest {
  to: string;
  subject: string;
  body: string;
  fromName?: string;
  cc?: string[];
  bcc?: string[];
  emailId?: string;
}

// Initialize email transporter (for production)
// You need to install nodemailer: npm install nodemailer @types/nodemailer
let transporter: any = null;

function getTransporter() {
  if (transporter) return transporter;

  // Example with Gmail SMTP
  // For production, use environment variables
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

export async function POST(request: NextRequest) {
  try {
    const body: SendEmailRequest = await request.json();
    const { to, subject, body: emailBody, fromName = 'Gavroch.dev.prospect', cc, bcc, emailId } = body;

    // Validate input
    if (!to || !subject || !emailBody) {
      return NextResponse.json(
        { error: 'to, subject, and body are required' },
        { status: 400 }
      );
    }

    // Get transporter
    const transporter = getTransporter();

    // For development/testing, you can use:
    // const testAccount = await nodemailer.createTestAccount();
    // This creates temporary email accounts for testing

    // Tracking pixel URL
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const pixelTag = emailId
      ? `<img src="${appUrl}/api/emails/track/open?id=${emailId}" width="1" height="1" style="display:block;width:1px;height:1px;" alt="" />`
      : '';

    // Convert plain text to HTML (preserve line breaks and paragraphs)
    const toHtml = (text: string) => {
      const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      // Auto-link URLs
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

    // Send email
    const info = await transporter.sendMail({
      from: `"${fromName}" <${process.env.SENDER_EMAIL}>`,
      to,
      cc,
      bcc,
      subject,
      html: htmlBody,
      text: emailBody.replace(/<[^>]*>/g, ''), // Plain text version
      // Set Message-ID so replies can be matched back to this emailId
      messageId: emailId
        ? `<hatmada-${emailId}@${(process.env.SMTP_USER || 'hatmada').split('@')[1] || 'hatmada.app'}>`
        : undefined,
    });

    console.log('Email sent:', info.messageId);

    // Track email in database
    // In production: save to your database
    // await saveEmailRecord({
    //   to,
    //   subject,
    //   status: 'sent',
    //   sentAt: new Date(),
    //   messageId: info.messageId,
    // });

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      to,
      subject,
      sentAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: String(error) },
      { status: 500 }
    );
  }
}

// GET method to verify email configuration
export async function GET(request: NextRequest) {
  try {
    const transporter = getTransporter();

    // Verify connection
    await transporter.verify();

    return NextResponse.json({
      success: true,
      message: 'SMTP connection verified',
      config: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        senderEmail: process.env.SENDER_EMAIL,
      },
    });
  } catch (error) {
    console.error('SMTP verification error:', error);
    return NextResponse.json(
      { error: 'SMTP configuration error', details: String(error) },
      { status: 500 }
    );
  }
}

/*
SETUP INSTRUCTIONS:

1. Install nodemailer:
   npm install nodemailer
   npm install -D @types/nodemailer

2. For Gmail:
   a. Enable 2-factor authentication
   b. Generate an "App Password" (not your regular password)
   c. Add to .env.local:
      SMTP_HOST=smtp.gmail.com
      SMTP_PORT=587
      SMTP_USER=your-email@gmail.com
      SMTP_PASS=your-16-char-app-password

3. For SendGrid:
   a. Get API key from SendGrid
   b. Add to .env.local:
      SMTP_HOST=smtp.sendgrid.net
      SMTP_PORT=587
      SMTP_USER=apikey
      SMTP_PASS=your-sendgrid-api-key

4. For AWS SES:
   a. Setup AWS credentials
   b. Add to .env.local:
      SMTP_HOST=email-smtp.region.amazonaws.com
      SMTP_PORT=587
      SMTP_USER=your-smtp-username
      SMTP_PASS=your-smtp-password

5. Testing:
   GET /api/emails/send  <- Will verify SMTP connection
   POST /api/emails/send <- Send email
   
   Body:
   {
     "to": "recipient@example.com",
     "subject": "Test Email",
     "body": "<h1>Test</h1><p>This is a test</p>",
     "fromName": "Gavroch.dev.prospect"
   }
*/
