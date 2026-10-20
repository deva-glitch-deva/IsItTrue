import type { Source } from "./types";

export function normalizeClaim(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKC")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/@[\w.]+/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncate(text: string, max = 180): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

export function splitSentences(text: string, max = 5): string[] {
  const cleaned = text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const parts = cleaned
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 12);
  if (parts.length === 0 && cleaned.length >= 3) return [cleaned];
  return parts.slice(0, max);
}

export function uniqueSources(sources: Source[]): Source[] {
  const seen = new Set<string>();
  return sources.filter((source) => {
    if (!source.url || seen.has(source.url)) return false;
    seen.add(source.url);
    return true;
  });
}

export function formatRelativeTime(iso: string, lang: "en" | "hinglish"): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60_000));
  if (minutes < 60) {
    return lang === "en" ? `${minutes}m ago` : `${minutes} min pehle`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return lang === "en" ? `${hours}h ago` : `${hours} ghante pehle`;
  }
  const days = Math.floor(hours / 24);
  return lang === "en" ? `${days}d ago` : `${days} din pehle`;
}

export function safeJsonParse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}
