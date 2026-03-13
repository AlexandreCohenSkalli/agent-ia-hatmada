import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/emails/debug-imap
 * Returns raw IMAP inbox data for the last 30 days – for debugging body fetch issues.
 */
export async function GET(_req: NextRequest) {
  const host = process.env.IMAP_HOST || process.env.SMTP_HOST;
  const port = parseInt(process.env.IMAP_PORT || '993', 10);
  const user = process.env.IMAP_USER || process.env.SMTP_USER;
  const pass = process.env.IMAP_PASS || process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return NextResponse.json({ error: 'Missing IMAP env vars' }, { status: 500 });
  }

  let ImapFlow: any;
  try {
    ImapFlow = (await import('imapflow')).ImapFlow;
  } catch {
    return NextResponse.json({ error: 'imapflow not installed' }, { status: 500 });
  }

  const client = new ImapFlow({
    host, port, secure: port === 993,
    auth: { user, pass },
    logger: false,
  });

  const results: any[] = [];

  try {
    await client.connect();
    const lock = await client.getMailboxLock('INBOX');

    try {
      const since = new Date();
      since.setDate(since.getDate() - 30);

      for await (const msg of client.fetch({ since }, { envelope: true, source: true })) {
        const fromEmail: string = (msg.envelope?.from?.[0]?.address || '').toLowerCase();

        // Skip own emails
        if (fromEmail === (user || '').toLowerCase()) continue;

        // Extract plain text from raw source
        let bodySnippet = '';
        try {
          const raw = (msg as any).source?.toString('utf8') || '';
          // Find end of headers (double CRLF or LF)
          const bodyStart = raw.indexOf('\r\n\r\n');
          const bodyRaw = bodyStart >= 0 ? raw.slice(bodyStart + 4) : raw;
          bodySnippet = bodyRaw
            .replace(/=\r?\n/g, '')           // quoted-printable soft line breaks
            .replace(/=[0-9A-Fa-f]{2}/g, ' ') // QP encoded chars
            .replace(/<[^>]+>/g, ' ')          // HTML tags
            .replace(/&nbsp;/g, ' ')
            .replace(/\s{2,}/g, '\n')
            .trim()
            .slice(0, 300);
        } catch {}

        results.push({
          seq: msg.seq,
          from: fromEmail,
          subject: msg.envelope?.subject || '',
          date: msg.envelope?.date,
          inReplyTo: (msg.envelope as any)?.inReplyTo || null,
          bodySnippet,
        });
      }
    } finally {
      lock.release();
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) });
  } finally {
    try { await client.logout(); } catch {}
  }

  return NextResponse.json({ count: results.length, messages: results });
}
