import { NextRequest, NextResponse } from 'next/server';
import { recordReply } from '@/lib/tracking-store';

/**
 * POST /api/emails/webhook/reply
 *
 * Universal webhook endpoint for incoming reply notifications.
 * Supports multiple providers – configure the webhook URL in your provider's dashboard.
 *
 * Supported providers:
 *   • Resend       – Event: email.replied
 *   • Mailgun      – event: complained / clicked (use "inbound" routes for replies)
 *   • Postmark     – RecordType: InboundEmail
 *   • SendGrid     – event: inbound_parse
 *   • Generic      – { emailId, fromEmail, subject }
 *
 * Security: set WEBHOOK_SECRET env var and providers will sign the request.
 * Validation is provider-specific; add HMAC checks as needed.
 */

function extractIdFromMessageId(messageId: string): string | null {
  // Convention: Message-ID contains hatmada-{emailId}
  const match = messageId?.match(/hatmada-([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let body: any = {};

    if (contentType.includes('application/json')) {
      body = await request.json();
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      for (const [key, value] of formData.entries()) {
        body[key] = value;
      }
    }

    let emailId: string | null = null;
    let fromEmail = '';
    let subject = '';

    // --- Resend ---
    if (body.type === 'email.replied' && body.data) {
      emailId = extractIdFromMessageId(body.data.headers?.['message-id'] || '');
      fromEmail = body.data.from || '';
      subject = body.data.subject || '';
    }

    // --- Postmark inbound ---
    else if (body.RecordType === 'InboundEmail') {
      emailId = extractIdFromMessageId(body.ReplyTo || body.Headers?.find((h: any) => h.Name === 'In-Reply-To')?.Value || '');
      fromEmail = body.From || '';
      subject = body.Subject || '';
    }

    // --- Mailgun inbound ---
    else if (body.sender && body.subject) {
      emailId = extractIdFromMessageId(body['In-Reply-To'] || body.references || '');
      fromEmail = body.sender || '';
      subject = body.subject || '';
    }

    // --- SendGrid inbound parse ---
    else if (body.to && body.from) {
      emailId = extractIdFromMessageId(body.headers || '');
      fromEmail = body.from || '';
      subject = body.subject || '';
    }

    // --- Generic / manual call ---
    else if (body.emailId) {
      emailId = body.emailId;
      fromEmail = body.fromEmail || 'unknown@example.com';
      subject = body.subject || '(Réponse)';
    }

    if (!emailId) {
      return NextResponse.json({ received: true, matched: false, reason: 'Could not extract emailId from payload' });
    }

    recordReply(emailId, fromEmail, subject);

    return NextResponse.json({ received: true, matched: true, emailId, fromEmail });
  } catch (error) {
    console.error('[webhook/reply] Error:', error);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}
