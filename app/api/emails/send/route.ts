import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer'; // Will need to add this to package.json

interface SendEmailRequest {
  to: string;
  subject: string;
  body: string;
  fromName?: string;
  cc?: string[];
  bcc?: string[];
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
    const { to, subject, body: emailBody, fromName = 'ProspectAI', cc, bcc } = body;

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

    // Send email
    const info = await transporter.sendMail({
      from: `"${fromName}" <${process.env.SENDER_EMAIL}>`,
      to,
      cc,
      bcc,
      subject,
      html: emailBody,
      text: emailBody.replace(/<[^>]*>/g, ''), // Plain text version
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
     "fromName": "ProspectAI"
   }
*/
