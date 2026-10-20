import { VERDICT_META } from "./constants";
import type { ClaimAnalysis, Verdict } from "./types";
import { uniqueSources } from "./text";

const RANK: Record<Verdict, number> = {
  TRUE: 0,
  UNVERIFIED: 1,
  MISLEADING: 2,
  FALSE: 3,
};

export function verdictFromSkin(label: string): Verdict | null {
  switch (label) {
    case "No Cap":
      return "TRUE";
    case "Cap":
      return "FALSE";
    case "Sus":
      return "MISLEADING";
    case "Idk Bro":
      return "UNVERIFIED";
    default:
      return null;
  }
}

export function skinFor(verdict: Verdict): string {
  return VERDICT_META[verdict].skin;
}

export function officialFor(verdict: Verdict): string {
  return VERDICT_META[verdict].official;
}

export function displayVerdict(
  verdict: Verdict,
  useSkin: boolean,
): string {
  if (!useSkin) return VERDICT_META[verdict].official;
  return VERDICT_META[verdict].skin;
}

export function aggregateVerdict(claims: ClaimAnalysis[]): {
  verdict: Verdict;
  confidence: number;
  summary: string;
  summaryHinglish: string;
} {
  if (claims.length === 0) {
    return {
      verdict: "UNVERIFIED",
      confidence: 0,
      summary:
        "We could not extract a checkable claim from this input. Try adding the exact wording.",
      summaryHinglish:
        "Is input se koi checkable claim nahi mila. Exact wording add karke try karo.",
    };
  }
  if (claims.length === 1) {
    const only = claims[0];
    return {
      verdict: only.verdict,
      confidence: only.confidence,
      summary: only.reasoning,
      summaryHinglish: only.reasoningHinglish,
    };
  }

  const counts = claims.reduce<Record<Verdict, number>>(
    (acc, claim) => {
      acc[claim.verdict] += 1;
      return acc;
    },
    { TRUE: 0, FALSE: 0, MISLEADING: 0, UNVERIFIED: 0 },
  );
  const uniqueVerdicts = (Object.keys(counts) as Verdict[]).filter(
    (key) => counts[key] > 0,
  );
  const confidence = Math.round(
    claims.reduce((sum, claim) => sum + claim.confidence, 0) / claims.length,
  );

  if (uniqueVerdicts.length === 1) {
    const verdict = uniqueVerdicts[0];
    return {
      verdict,
      confidence,
      summary: `${claims.length} claims were checked. All landed on the same verdict: ${VERDICT_META[verdict].official}.`,
      summaryHinglish: `${claims.length} claims check hue. Sabka verdict same nikla: ${VERDICT_META[verdict].official}.`,
    };
  }

  const verdict = uniqueVerdicts.includes("FALSE")
    ? "MISLEADING"
    : uniqueVerdicts.includes("MISLEADING")
      ? "MISLEADING"
      : "UNVERIFIED";
  const countsText = uniqueVerdicts
    .map((key) => `${counts[key]} ${VERDICT_META[key].official.toLowerCase()}`)
    .join(", ");

  return {
    verdict,
    confidence,
    summary: `The post mixes verdicts (${countsText}). Treat it as ${VERDICT_META[verdict].official.toLowerCase()} as a whole.`,
    summaryHinglish: `Post mein alag-alag verdicts hain (${countsText}). Poore post ko ${VERDICT_META[verdict].official} maan kar chalein.`,
  };
}

export function allSources(claims: ClaimAnalysis[]) {
  return uniqueSources(claims.flatMap((claim) => claim.sources));
}

export function highestRank(claims: ClaimAnalysis[]): Verdict {
  return claims.reduce<Verdict>(
    (worst, claim) => (RANK[claim.verdict] > RANK[worst] ? claim.verdict : worst),
    "TRUE",
  );
}
