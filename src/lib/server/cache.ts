import { CACHE_DAYS } from "../constants";
import type { AnalysisResult, Language, TrendingItem } from "../types";
import { shouldListTrending } from "../safety";
import { getPrisma, hasDatabase, type CacheRecord } from "./db";
import { seededCacheRows } from "./seed-results";

interface MemoryStore {
  byKey: Map<string, CacheRecord>;
  byId: Map<string, CacheRecord>;
}

type GlobalCache = typeof globalThis & {
  __isItTrueCache?: MemoryStore;
};

const globalCache = globalThis as GlobalCache;

function store(): MemoryStore {
  if (globalCache.__isItTrueCache) return globalCache.__isItTrueCache;
  const byKey = new Map<string, CacheRecord>();
  const byId = new Map<string, CacheRecord>();
  const now = new Date();
  for (const row of seededCacheRows(now)) {
    const record: CacheRecord = {
      id: row.result.id,
      cacheKey: row.cacheKey,
      normalized: row.result.rawInput.toLowerCase(),
      language: row.result.language,
      inputType: row.result.inputType,
      rawInput: row.result.rawInput,
      result: row.result,
      serious: row.result.serious,
      sensitive: row.result.sensitive,
      category: row.result.category,
      checks: row.checks,
      recentChecks: row.recentChecks,
      createdAt: row.createdAt,
      updatedAt: row.createdAt,
      lastCheckedAt: row.lastCheckedAt,
    };
    byKey.set(record.cacheKey, record);
    byId.set(record.id, record);
  }
  globalCache.__isItTrueCache = { byKey, byId };
  return globalCache.__isItTrueCache;
}

export function cacheIsFresh(createdAt: Date | string): boolean {
  const age = Date.now() - new Date(createdAt).getTime();
  return age >= 0 && age < CACHE_DAYS * 24 * 60 * 60 * 1000;
}

function asResult(record: CacheRecord): AnalysisResult {
  return record.result as AnalysisResult;
}

export async function cacheGetByKey(
  cacheKey: string,
): Promise<CacheRecord | null> {
  const prisma = getPrisma();
  if (prisma) {
    try {
      const row = await prisma.analysis.findUnique({ where: { cacheKey } });
      if (row) {
        const record = row as unknown as CacheRecord;
        store().byKey.set(cacheKey, record);
        store().byId.set(record.id, record);
        return record;
      }
    } catch (error) {
      console.warn("Cache read failed, using memory:", error);
    }
  }
  return store().byKey.get(cacheKey) ?? null;
}

export async function cacheGetById(id: string): Promise<CacheRecord | null> {
  const prisma = getPrisma();
  if (prisma) {
    try {
      const row = await prisma.analysis.findUnique({ where: { id } });
      if (row) {
        const record = row as unknown as CacheRecord;
        store().byId.set(record.id, record);
        store().byKey.set(record.cacheKey, record);
        return record;
      }
    } catch (error) {
      console.warn("Cache id read failed, using memory:", error);
    }
  }
  return store().byId.get(id) ?? null;
}

export async function cacheSave(
  input: {
    id: string;
    cacheKey: string;
    normalized: string;
    language: Language;
    inputType: string;
    rawInput: string;
    result: AnalysisResult;
    serious: boolean;
    sensitive: boolean;
    category: string | null;
    createdAt: Date;
  },
): Promise<CacheRecord> {
  const existing = store().byId.get(input.id);
  const record: CacheRecord = {
    id: input.id,
    cacheKey: input.cacheKey,
    normalized: input.normalized,
    language: input.language,
    inputType: input.inputType,
    rawInput: input.rawInput,
    result: input.result,
    serious: input.serious,
    sensitive: input.sensitive,
    category: input.category,
    checks: existing?.checks ?? 1,
    recentChecks: existing?.recentChecks ?? 1,
    createdAt: input.createdAt,
    updatedAt: new Date(),
    lastCheckedAt: new Date(),
  };
  store().byKey.set(record.cacheKey, record);
  store().byId.set(record.id, record);

  const prisma = getPrisma();
  if (prisma) {
    try {
      await prisma.analysis.upsert({
        where: { cacheKey: input.cacheKey },
        create: {
          id: record.id,
          cacheKey: record.cacheKey,
          normalized: record.normalized,
          language: record.language,
          inputType: record.inputType,
          rawInput: record.rawInput,
          result: input.result as unknown as object,
          serious: record.serious,
          sensitive: record.sensitive,
          category: record.category,
          checks: record.checks,
          recentChecks: record.recentChecks,
          createdAt: record.createdAt,
          lastCheckedAt: record.lastCheckedAt,
        },
        update: {
          result: input.result as unknown as object,
          updatedAt: new Date(),
          lastCheckedAt: new Date(),
        },
      });
    } catch (error) {
      console.warn("Cache write failed, kept in memory:", error);
    }
  }
  return record;
}

export async function cacheTouch(record: CacheRecord): Promise<CacheRecord> {
  const now = new Date();
  const recentWindow = 24 * 60 * 60 * 1000;
  const withinDay = now.getTime() - new Date(record.lastCheckedAt).getTime() < recentWindow;
  const next: CacheRecord = {
    ...record,
    checks: record.checks + 1,
    recentChecks: withinDay ? record.recentChecks + 1 : 1,
    lastCheckedAt: now,
  };
  store().byId.set(next.id, next);
  store().byKey.set(next.cacheKey, next);

  const prisma = getPrisma();
  if (prisma) {
    try {
      await prisma.analysis.update({
        where: { id: record.id },
        data: {
          checks: { increment: 1 },
          recentChecks: withinDay ? { increment: 1 } : 1,
          lastCheckedAt: now,
        },
      });
    } catch (error) {
      console.warn("Cache touch failed:", error);
    }
  }
  return next;
}

export async function cacheReuse(record: CacheRecord): Promise<AnalysisResult> {
  const touched = await cacheTouch(record);
  const result = asResult(touched);
  return {
    ...result,
    fromCache: true,
    checks: touched.checks,
    createdAt: touched.createdAt.toISOString(),
    confidenceWhy: result.confidenceWhy
      ? `${result.confidenceWhy} Reused from a check less than 7 days old.`
      : "Reused from a check less than 7 days old.",
  };
}

function toTrending(record: CacheRecord): TrendingItem | null {
  const result = asResult(record);
  const main = result.claims[0];
  if (!main) return null;
  const moderation = shouldListTrending(main.text);
  if (!moderation.allowed) return null;
  return {
    id: result.id,
    claim: main.text,
    verdict: result.verdict,
    checks: record.recentChecks,
    category: result.category,
    sensitive: result.sensitive,
    lastCheckedAt: record.lastCheckedAt.toISOString(),
  };
}

export async function listTrending(
  language: Language,
  limit = 10,
): Promise<TrendingItem[]> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const prisma = getPrisma();
  if (prisma) {
    try {
      const rows = await prisma.analysis.findMany({
        where: { language, lastCheckedAt: { gte: cutoff } },
        orderBy: [{ recentChecks: "desc" }, { lastCheckedAt: "desc" }],
        take: 40,
      });
      const items = (rows as unknown as CacheRecord[])
        .map(toTrending)
        .filter((item): item is TrendingItem => item !== null)
        .slice(0, limit);
      if (items.length > 0) return items;
    } catch (error) {
      console.warn("Trending read failed, using memory:", error);
    }
  }
  const fromMemory = [...store().byKey.values()]
    .filter((record) => record.language === language)
    .sort(
      (a, b) =>
        b.recentChecks - a.recentChecks ||
        new Date(b.lastCheckedAt).getTime() - new Date(a.lastCheckedAt).getTime(),
    );
  const fresh = fromMemory.filter(
    (record) => new Date(record.lastCheckedAt).getTime() >= cutoff.getTime(),
  );
  const pool = fresh.length > 0 ? fresh : fromMemory;
  return pool
    .map(toTrending)
    .filter((item): item is TrendingItem => item !== null)
    .slice(0, limit);
}

export function cacheMode(): "postgres" | "memory" {
  return hasDatabase() ? "postgres" : "memory";
}

export function memoryCacheSize(): number {
  return store().byKey.size;
}
