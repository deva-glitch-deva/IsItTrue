import { DISCLAIMER, DISCLAIMER_HINGLISH } from "./constants";
import { SEED_CLAIMS, type SeedClaim } from "./seed-claims";
import {
  confidenceWhy,
  independentSourceCount,
  sourcesDisagree,
  withSourceKind,
} from "./sources";
import type { AnalysisResult, Language } from "./types";

export { SEED_CLAIMS };

export function buildClientSeedResult(
  seed: SeedClaim,
  language: Language,
): AnalysisResult {
  const sources = seed.sources.map(withSourceKind);
  const independent = independentSourceCount(sources);
  const disagree = sourcesDisagree(sources);
  return {
    id: `seed-${seed.slug}-${language}`,
    inputType: seed.inputType ?? "text",
    rawInput: seed.reelUrl ?? seed.text,
    language,
    claims: [
      {
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
        sources,
        sensitive: seed.sensitive,
        category: seed.category,
      },
    ],
    verdict: seed.verdict,
    confidence: seed.confidence,
    summary: seed.reasoning,
    summaryHinglish: seed.reasoningHinglish,
    sources,
    serious: seed.sensitive,
    sensitive: seed.sensitive,
    category: seed.category,
    fromCache: false,
    createdAt: new Date().toISOString(),
    checks: 12,
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
      verdict: seed.verdict,
      confidence: seed.confidence,
      independent,
      fromCache: false,
      demoMode: true,
      disagree,
    }),
  };
}
