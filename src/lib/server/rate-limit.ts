import { RATE_LIMIT, RATE_WINDOW_MS } from "../constants";

interface Bucket {
  count: number;
  resetAt: number;
}

type GlobalRate = typeof globalThis & {
  __isItTrueRate?: Map<string, Bucket>;
};

const globalRate = globalThis as GlobalRate;

function buckets(): Map<string, Bucket> {
  if (!globalRate.__isItTrueRate) {
    globalRate.__isItTrueRate = new Map();
  }
  return globalRate.__isItTrueRate;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

export interface RateResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
}

export function rateLimit(key: string): RateResult {
  const now = Date.now();
  const map = buckets();
  for (const [bucketKey, bucket] of map) {
    if (bucket.resetAt < now) map.delete(bucketKey);
  }
  const bucket = map.get(key);
  if (!bucket || bucket.resetAt < now) {
    map.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT - 1, retryAfter: 0 };
  }
  if (bucket.count >= RATE_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  bucket.count += 1;
  return {
    allowed: true,
    remaining: RATE_LIMIT - bucket.count,
    retryAfter: 0,
  };
}
