import { NextRequest, NextResponse } from 'next/server';
import { recordReply, getReplyStatus, resetReplies } from '@/lib/tracking-store';

interface EmailRef {
  id: string;
  subject?: string;       // original subject – for "Re: {subject}" matching
  prospectEmail?: string; // recipient – to validate the reply sender
  sentAtIso?: string;     // ISO timestamp of when email was sent – replies must arrive AFTER this
}

async function checkImapReplies(emails: EmailRef[]): Promise<{ emailId: string; fromEmail: string; subject: string; replyBody?: string }[]> {
  const host = process.env.IMAP_HOST || process.env.SMTP_HOST;
  const port = parseInt(process.env.IMAP_PORT || '993', 10);
  const user = process.env.IMAP_USER || process.env.SMTP_USER;
  const pass = process.env.IMAP_PASS || process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.log('[check-replies] Missing IMAP env vars');
    return [];
  }

  let ImapFlow: any;
  try {
    ImapFlow = (await import('imapflow')).ImapFlow;
  } catch {
    console.log('[check-replies] imapflow not installed');
    return [];
  }

  const client = new ImapFlow({
    host,
    port,
    secure: port === 993,
    auth: { user, pass },
    logger: false,
  });

  const detected: { emailId: string; fromEmail: string; subject: string; replyBody?: string }[] = [];

  try {
    await client.connect();
    const lock = await client.getMailboxLock('INBOX');

    try {
      const since = new Date();
      since.setDate(since.getDate() - 30);

      // Map: normalised subject → list of { id, prospectEmail }
      // (multiple emails can share the same subject template)
      const subjectMap = new Map<string, { id: string; prospectEmail: string }[]>();
      for (const e of emails) {
        if (e.subject) {
          const key = normaliseSubject(e.subject);
          if (!subjectMap.has(key)) subjectMap.set(key, []);
          subjectMap.get(key)!.push({ id: e.id, prospectEmail: e.prospectEmail || '' });
        }
      }

      // Map: emailId → { prospectEmail, sentAt } for method-1 validation
      const idToProspect = new Map<string, { prospectEmail: string; sentAt: Date | null }>(
        emails.map(e => [e.id, {
          prospectEmail: e.prospectEmail || '',
          sentAt: e.sentAtIso ? new Date(e.sentAtIso) : null,
        }])
      );

      const ownEmail = (user || '').toLowerCase();

      for await (const msg of client.fetch({ since }, { envelope: true, source: true })) {
        const rawSubject: string = msg.envelope?.subject || '';
        const fromEmail: string = (msg.envelope?.from?.[0]?.address || '').toLowerCase();
        const inReplyTo: string = (msg.envelope as any)?.inReplyTo || '';
        // Extract plain text from raw RFC822 source
        const rawBody: string = (() => {
          try {
            const raw = (msg as any).source?.toString('utf8') || '';
            // Split main headers from body
            const mainHeadersEnd = raw.indexOf('\r\n\r\n');
            if (mainHeadersEnd < 0) return '';
            const mainHeaders = raw.slice(0, mainHeadersEnd);
            const rest = raw.slice(mainHeadersEnd + 4);

            let plainText = '';

            // Multipart: find the text/plain part
            const boundaryMatch = mainHeaders.match(/boundary="?([^"\r\n;]+)"?/i);
            if (boundaryMatch) {
              const boundary = '--' + boundaryMatch[1].trim();
              const parts = rest.split(boundary);
              for (const part of parts) {
                if (/content-type:\s*text\/plain/i.test(part)) {
                  const partBodyStart = part.indexOf('\r\n\r\n');
                  if (partBodyStart >= 0) { plainText = part.slice(partBodyStart + 4); break; }
                }
              }
            } else {
              plainText = rest;
            }

            // Decode quoted-printable
            plainText = plainText
              .replace(/=\r?\n/g, '')
              .replace(/=[0-9A-Fa-f]{2}/g, m => {
                try { return String.fromCharCode(parseInt(m.slice(1), 16)); } catch { return ' '; }
              });

            // Strip HTML tags and entities
            plainText = plainText.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&[a-z]+;/gi, ' ');

            // Strip quoted original email (separator lines, "De :", "From:", "> " lines)
            const quotedStart = plainText.search(/(\r?\n[-_]{5,}|\r?\n[ \t]*>|\r?\n(De|From|Envoy|Sent)\s*:)/im);
            if (quotedStart > 0) plainText = plainText.slice(0, quotedStart);

            return plainText.replace(/\s{2,}/g, '\n').trim().slice(0, 1200);
          } catch { return ''; }
        })();

        // Skip messages sent by ourselves – these are original emails landing in inbox, not replies
        if (fromEmail === ownEmail) continue;
        console.log('[check-replies] candidate msg | from:', fromEmail, '| inReplyTo:', inReplyTo ? inReplyTo.slice(0, 60) : '(none)', '| bodyLen:', rawBody.length);

        // Skip messages with no In-Reply-To header – they are not replies
        const isActualReply = !!inReplyTo;

        // Message received date (for temporal filtering)
        const msgDate: Date | null = msg.envelope?.date ? new Date(msg.envelope.date) : null;

        // --- Method 1: Message-ID contains hatmada-{id} ---
        if (isActualReply) {
          for (const [emailId, { prospectEmail, sentAt }] of idToProspect) {
            const tag = `hatmada-${emailId}`;
            if (inReplyTo.includes(tag)) {
              const senderMatch = !prospectEmail || fromEmail === prospectEmail.toLowerCase();
              // Must arrive AFTER the email was sent
              const dateOk = !sentAt || !msgDate || msgDate > sentAt;
              if (senderMatch && dateOk && !detected.find(d => d.emailId === emailId)) {
                detected.push({ emailId, fromEmail, subject: rawSubject, replyBody: rawBody || undefined });
              }
            }
          }
        }

        // --- Method 2: Subject "Re: {original subject}" ---
        // STRICT validation:
        // - Must be an actual reply (has In-Reply-To)
        // - Sender must match
        // - If sentAt is known: reply MUST arrive after sending (no guessing)
        // - If sentAt is missing: only accept if within 7 days (avoid old replies)
        if (isActualReply && rawSubject.toLowerCase().startsWith('re:')) {
          const base = normaliseSubject(rawSubject);
          const candidates = subjectMap.get(base) || [];
          for (const { id, prospectEmail } of candidates) {
            if (detected.find(d => d.emailId === id)) continue;
            const { sentAt } = idToProspect.get(id) || { sentAt: null };
            
            // Check sender match first (required)
            if (!prospectEmail || fromEmail !== prospectEmail.toLowerCase()) continue;
            
            // Date validation logic:
            let dateOk = false;
            if (sentAt && msgDate) {
              // If we know when email was sent: reply MUST be after sending
              dateOk = msgDate > sentAt;
            } else if (!sentAt && msgDate) {
              // If no sent date recorded: only accept replies from last 7 days
              // (this prevents matching ancient replies)
              const sevenDaysAgo = new Date();
              sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
              dateOk = msgDate > sevenDaysAgo;
            }
            
            if (dateOk) {
              detected.push({ emailId: id, fromEmail, subject: rawSubject, replyBody: rawBody || undefined });
            }
          }
        }
      }
    } finally {
      lock.release();
    }
  } catch (err) {
    console.error('[check-replies] IMAP error:', err);
  } finally {
    try { await client.logout(); } catch {}
  }

  return detected;
}

/** Strip "Re:", "Re[2]:", "Fwd:", "Tr:", etc. and trim for comparison */
function normaliseSubject(subject: string): string {
  return subject
    .replace(/^(re|fwd?|tr|réf?)(\[\d+\])?:\s*/i, '')
    .trim()
    .toLowerCase();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Accept both old format { emailIds } and new format { emails }
    const emails: EmailRef[] = body.emails
      || (body.emailIds as string[])?.map((id: string) => ({ id }))
      || [];

    if (emails.length === 0) {
      return NextResponse.json({ error: 'emails array required' }, { status: 400 });
    }

    const imapResults = await checkImapReplies(emails);

    for (const { emailId, fromEmail, subject, replyBody } of imapResults) {
      recordReply(emailId, fromEmail, subject, replyBody);
    }

    const replyStatus = getReplyStatus(emails.map(e => e.id));

    return NextResponse.json({
      checked: emails.length,
      newReplies: imapResults.length,
      replyStatus,
    });
  } catch (error) {
    console.error('[check-replies] Error:', error);
    return NextResponse.json({ error: 'Error checking replies', details: String(error) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const idsParam = request.nextUrl.searchParams.get('ids');
  if (!idsParam) {
    return NextResponse.json({ error: 'ids parameter required' }, { status: 400 });
  }
  const ids = idsParam.split(',').filter(Boolean);
  const replyStatus = getReplyStatus(ids);
  return NextResponse.json({ replyStatus });
}

/** DELETE /api/emails/check-replies?ids=id1,id2  – reset specific reply records
 *  DELETE /api/emails/check-replies               – reset ALL reply records */
export async function DELETE(request: NextRequest) {
  const idsParam = request.nextUrl.searchParams.get('ids');
  const ids = idsParam ? idsParam.split(',').filter(Boolean) : undefined;
  resetReplies(ids);
  return NextResponse.json({ success: true, reset: ids ?? 'all' });
}
