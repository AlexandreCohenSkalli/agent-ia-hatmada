import fs from 'fs';
import path from 'path';
import os from 'os';

const STORE_PATH = path.join(os.tmpdir(), 'hatmada-tracking.json');

interface TrackingStore {
  opens: Record<string, { openedAt: string; count: number }>;
}

function read(): TrackingStore {
  try {
    if (fs.existsSync(STORE_PATH)) {
      return JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
    }
  } catch {}
  return { opens: {} };
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
