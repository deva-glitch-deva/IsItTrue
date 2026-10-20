import { PrismaClient } from "@prisma/client";

type GlobalPrisma = typeof globalThis & {
  __isItTruePrisma?: PrismaClient | null;
};

const globalForPrisma = globalThis as GlobalPrisma;

export function getPrisma(): PrismaClient | null {
  if (!process.env.DATABASE_URL) return null;
  if (globalForPrisma.__isItTruePrisma !== undefined) {
    return globalForPrisma.__isItTruePrisma;
  }
  try {
    const client = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error"] : ["error"],
    });
    globalForPrisma.__isItTruePrisma = client;
    return client;
  } catch (error) {
    console.error("Prisma client could not start:", error);
    globalForPrisma.__isItTruePrisma = null;
    return null;
  }
}

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export interface CacheRecord {
  id: string;
  cacheKey: string;
  normalized: string;
  language: string;
  inputType: string;
  rawInput: string;
  result: unknown;
  serious: boolean;
  sensitive: boolean;
  category: string | null;
  checks: number;
  recentChecks: number;
  createdAt: Date;
  updatedAt: Date;
  lastCheckedAt: Date;
}
