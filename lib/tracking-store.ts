import fs from 'fs';
import path from 'path';
import os from 'os';
import { EventEmitter } from 'events';

const STORE_PATH = path.join(os.tmpdir(), 'hatmada-tracking.json');

interface TrackingStore {
  opens: Record<string, { openedAt: string; count: number }>;
  replies: Record<string, { repliedAt: string; fromEmail: string; subject: string; replyBody?: string }>;
}

// Global event emitter so SSE streams can be notified on new replies
export const replyEmitter = new EventEmitter();

function read(): TrackingStore {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
      return { opens: parsed.opens || {}, replies: parsed.replies || {} };
    }
  } catch {}
  return { opens: {}, replies: {} };
}

function write(store: TrackingStore) {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(store), 'utf-8');
  } catch {}
}

export function recordOpen(emailId: string) {
  const store = read();
  if (store.opens[emailId]) {
    store.opens[emailId].count += 1;
  } else {
    store.opens[emailId] = { openedAt: new Date().toISOString(), count: 1 };
  }
  write(store);
}

export function getOpenStatus(emailIds: string[]): Record<string, { openedAt: string; count: number } | null> {
  const store = read();
  const result: Record<string, { openedAt: string; count: number } | null> = {};
  for (const id of emailIds) {
    result[id] = store.opens[id] ?? null;
  }
  return result;
}

export function recordReply(emailId: string, fromEmail: string, subject: string, replyBody?: string) {
  const store = read();
  const existing = store.replies[emailId];
  if (!existing) {
    store.replies[emailId] = {
      repliedAt: new Date().toISOString(),
      fromEmail,
      subject,
      ...(replyBody ? { replyBody } : {}),
    };
    write(store);
    replyEmitter.emit('reply', { emailId, fromEmail, subject, replyBody, repliedAt: store.replies[emailId].repliedAt });
  } else if (replyBody) {
    // Always update with the latest (better-parsed) body
    store.replies[emailId] = { ...existing, replyBody };
    write(store);
    replyEmitter.emit('reply', { emailId, fromEmail: existing.fromEmail, subject: existing.subject, replyBody, repliedAt: existing.repliedAt });
  }
}

export function getReplyStatus(emailIds: string[]): Record<string, { repliedAt: string; fromEmail: string; subject: string; replyBody?: string } | null> {
  const store = read();
  const result: Record<string, { repliedAt: string; fromEmail: string; subject: string; replyBody?: string } | null> = {};
  for (const id of emailIds) {
    result[id] = store.replies[id] ?? null;
  }
  return result;
}

export function getAllReplies(): TrackingStore['replies'] {
  return read().replies;
}

export function resetReplies(emailIds?: string[]) {
  const store = read();
  if (emailIds) {
    emailIds.forEach(id => { delete store.replies[id]; });
  } else {
    store.replies = {};
  }
  write(store);
}
