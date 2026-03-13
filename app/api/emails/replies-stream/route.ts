import { NextRequest } from 'next/server';
import { replyEmitter, getAllReplies } from '@/lib/tracking-store';

/**
 * GET /api/emails/replies-stream
 *
 * Server-Sent Events (SSE) endpoint.
 * The browser connects once and receives real-time "reply" events
 * whenever a client responds to a prospecting email.
 *
 * Events emitted:
 *   data: { type: "reply", emailId, fromEmail, subject, repliedAt }
 *   data: { type: "ping" }   – keepalive every 25s
 *
 * Usage (client):
 *   const es = new EventSource('/api/emails/replies-stream');
 *   es.onmessage = (e) => { const d = JSON.parse(e.data); ... }
 */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {}
      };

      // Send current snapshot of all known replies so the client can sync state immediately
      const existing = getAllReplies();
      if (Object.keys(existing).length > 0) {
        send({ type: 'snapshot', replies: existing });
      }

      // Keepalive ping every 25 seconds to prevent proxy timeouts
      const pingInterval = setInterval(() => {
        send({ type: 'ping' });
      }, 25_000);

      // Listen for new replies
      const onReply = (payload: object) => {
        send({ type: 'reply', ...payload });
      };
      replyEmitter.on('reply', onReply);

      // Cleanup when client disconnects
      request.signal.addEventListener('abort', () => {
        clearInterval(pingInterval);
        replyEmitter.off('reply', onReply);
        try { controller.close(); } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}
