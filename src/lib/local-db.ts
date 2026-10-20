"use client";

import { MAX_HISTORY } from "./constants";
import type { AnalysisResult, HistoryItem, Language } from "./types";

const DB_NAME = "is-it-true";
const DB_VERSION = 1;
const STORE = "checks";

interface StoredHistory extends HistoryItem {
  full: AnalysisResult;
}

function hasIndexedDb(): boolean {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("checkedAt", "checkedAt");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveHistory(
  result: AnalysisResult,
  language: Language,
): Promise<void> {
  if (!hasIndexedDb()) return;
  const db = await openDb();
  const mainClaim = result.claims[0]?.text ?? result.rawInput;
  const item: StoredHistory = {
    id: result.id,
    claim: mainClaim.slice(0, 280),
    verdict: result.verdict,
    confidence: result.confidence,
    checkedAt: result.createdAt || new Date().toISOString(),
    language,
    full: result,
  };
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    store.put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  const all = await listHistory();
  if (all.length > MAX_HISTORY) {
    const extra = all.slice(MAX_HISTORY);
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    for (const old of extra) store.delete(old.id);
    await new Promise<void>((resolve) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  }
  db.close();
}

export async function listHistory(): Promise<HistoryItem[]> {
  if (!hasIndexedDb()) return [];
  const db = await openDb();
  const items = await new Promise<HistoryItem[]>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as StoredHistory[]);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return items
    .map((item) => {
      const rest = { ...item };
      delete (rest as { full?: AnalysisResult }).full;
      return rest;
    })
    .sort(
      (a, b) =>
        new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime(),
    );
}

export async function getHistoryResult(
  id: string,
): Promise<AnalysisResult | null> {
  if (!hasIndexedDb()) return null;
  const db = await openDb();
  const item = await new Promise<StoredHistory | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result as StoredHistory | undefined);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return item?.full ?? null;
}

export async function deleteHistoryItem(id: string): Promise<void> {
  if (!hasIndexedDb()) return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function clearHistory(): Promise<void> {
  if (!hasIndexedDb()) return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export function exportHistory(items: HistoryItem[]): string {
  return JSON.stringify(
    {
      app: "Is It True",
      exportedAt: new Date().toISOString(),
      count: items.length,
      checks: items,
    },
    null,
    2,
  );
}

export const DAILY_STORAGE_KEY = "iit-daily-played";

export function getDailyPlayed(dayKey: string): {
  score: number;
  dayKey: string;
  answers?: boolean[];
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DAILY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      score: number;
      dayKey: string;
      answers?: boolean[];
    };
    return parsed.dayKey === dayKey ? parsed : null;
  } catch {
    return null;
  }
}

export function setDailyPlayed(
  dayKey: string,
  score: number,
  answers?: boolean[],
): void {
  if (typeof window === "undefined") return;
  const previous = getDailyStreakMeta();
  if (previous?.dayKey && previous.dayKey > dayKey) return;
  const alreadyToday = previous?.dayKey === dayKey;
  const streak = alreadyToday
    ? previous.streak
    : previous && nextDay(previous.dayKey) === dayKey
      ? previous.streak + 1
      : 1;
  localStorage.setItem(
    DAILY_STORAGE_KEY,
    JSON.stringify({
      dayKey,
      score,
      streak,
      playedAt: Date.now(),
      answers: answers ?? (alreadyToday ? previous.answers : undefined),
    }),
  );
}

function nextDay(dayKey: string): string {
  const date = new Date(`${dayKey}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

export function getDailyStreakMeta(): {
  dayKey: string;
  score: number;
  streak: number;
  answers?: boolean[];
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DAILY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      dayKey?: string;
      score?: number;
      streak?: number;
      answers?: boolean[];
    };
    if (!parsed.dayKey) return null;
    return {
      dayKey: parsed.dayKey,
      score: parsed.score ?? 0,
      streak: parsed.streak ?? 1,
      answers: parsed.answers,
    };
  } catch {
    return null;
  }
}

export async function seedDemoHistory(): Promise<void> {
  if (!hasIndexedDb()) return;
  const { buildClientSeedResult, SEED_CLAIMS } = await import("./demo-seed");
  for (const seed of SEED_CLAIMS) {
    await saveHistory(buildClientSeedResult(seed, "en"), "en");
  }
}
