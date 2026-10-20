import { DISCLAIMER, DISCLAIMER_HINGLISH } from "../constants";
import type { SeedClaim } from "../seed-claims";
import { SEED_CLAIMS } from "../seed-claims";
import {
  confidenceWhy,
  independentSourceCount,
  sourcesDisagree,
  withSourceKind,
} from "../sources";
import type { AnalysisResult, ClaimAnalysis, Language } from "../types";
import { claimHash } from "./hash";

export function buildSeedClaimAnalysis(
  seed: SeedClaim,
  language: Language,
): ClaimAnalysis {
  return {
    id: `claim-${seed.slug}-${language}`,
    text: seed.text,
    verdict: seed.verdict,
    confidence: seed.confidence,
    reasoning: seed.reasoning,
    reasoningHinglish: seed.reasoningHinglish,
    reelSays: seed.reelSays,
    reelSaysHinglish: seed.reelSaysHinglish,
    sourcesSay: seed.sourcesSay,
    sourcesSayHinglish: seed.sourcesSayHinglish,
    sources: seed.sources.map(withSourceKind),
    sensitive: seed.sensitive,
    category: seed.category,
  };
}

export function buildSeedResult(
  seed: SeedClaim,
  language: Language,
  checks: number,
  createdAt = new Date(),
): AnalysisResult {
  const claim = buildSeedClaimAnalysis(seed, language);
  const sources = seed.sources.map(withSourceKind);
  const independent = independentSourceCount(sources);
  const disagree = sourcesDisagree(sources);
  return {
    id: `seed-${seed.slug}-${language}`,
    inputType: seed.inputType ?? "text",
    rawInput: seed.reelUrl ?? seed.text,
    language,
    claims: [claim],
    verdict: claim.verdict,
    confidence: claim.confidence,
    summary: seed.reasoning,
    summaryHinglish: seed.reasoningHinglish,
    sources,
    serious: seed.sensitive,
    sensitive: seed.sensitive,
    category: seed.category,
    fromCache: false,
    createdAt: createdAt.toISOString(),
    checks,
    demoMode: true,
    disclaimer: DISCLAIMER,
    disclaimerHinglish: DISCLAIMER_HINGLISH,
    warnings:
      seed.inputType === "reel"
        ? [
            "Public oEmbed returned no caption. The pasted caption was used instead.",
          ]
        : [],
    transcript:
      seed.inputType === "reel" ? seed.reelSays : undefined,
    independentSources: independent,
    sourcesDisagree: disagree,
    confidenceWhy: confidenceWhy({
      verdict: claim.verdict,
      confidence: claim.confidence,
      independent,
      fromCache: false,
      demoMode: true,
      disagree,
    }),
  };
}

const SEED_CHECK_COUNTS: Record<string, number> = {
  "eiffel-temporary": 184,
  "lemon-cancer": 412,
  "carrots-night-vision": 267,
  "study-92-percent": 143,
  "great-wall-space": 356,
  "nasa-darkness": 321,
};

export function seededCacheRows(now = new Date()) {
  const rows: Array<{
    cacheKey: string;
    result: AnalysisResult;
    createdAt: Date;
    lastCheckedAt: Date;
    checks: number;
    recentChecks: number;
  }> = [];
  for (const [index, seed] of SEED_CLAIMS.entries()) {
    for (const language of ["en", "hinglish"] as const) {
      const checks = SEED_CHECK_COUNTS[seed.slug] ?? 100;
      const createdAt = new Date(
        now.getTime() - (index + 1) * 3.2 * 60 * 60 * 1000,
      );
      const result = buildSeedResult(seed, language, checks, createdAt);
      rows.push({
        cacheKey: claimHash(seed.text, language),
        result,
        createdAt,
        lastCheckedAt: new Date(
          now.getTime() - (index + 1) * 28 * 60 * 1000,
        ),
        checks,
        recentChecks: checks,
      });
    }
  }
  return rows;
}
