import {
  DISCLAIMER,
  DISCLAIMER_HINGLISH,
} from "../constants";
import { getAdapters } from "../adapters";
import { searchWikipedia } from "../adapters/wikipedia";
import { detectPromptInjection, classifySensitive } from "../safety";
import { SEED_CLAIMS, findSeedClaim } from "../seed-claims";
import {
  confidenceWhy,
  independentSourceCount,
  sourcesDisagree,
  withSourceKind,
} from "../sources";
import { normalizeClaim, uniqueSources } from "../text";
import type {
  AnalysisResult,
  ClaimAnalysis,
  InputType,
  Language,
  Source,
  Verdict,
} from "../types";
import { aggregateVerdict, allSources } from "../verdicts";
import { cacheGetByKey, cacheReuse, cacheSave } from "./cache";
import { claimHash, shortHash } from "./hash";
import { fetchReelMetadata } from "./reel";
import { buildSeedClaimAnalysis, buildSeedResult } from "./seed-results";

export interface PipelineInput {
  inputType: InputType;
  language: Language;
  text: string;
  sourceUrl?: string;
  file?: {
    buffer: ArrayBuffer;
    fileName: string;
    mimeType: string;
  };
}

export interface PipelineResult {
  result: AnalysisResult;
  cacheMiss: boolean;
}

function emptyInputResult(
  input: PipelineInput,
  language: Language,
  warnings: string[],
): AnalysisResult {
  const id = `unverified-${shortHash(`${input.text}-${Date.now()}`)}`;
  return {
    id,
    inputType: input.inputType,
    rawInput: input.text || input.sourceUrl || "",
    language,
    claims: [],
    verdict: "UNVERIFIED",
    confidence: 0,
    summary:
      "We could not extract a checkable factual claim. Try adding the exact claim text or caption.",
    summaryHinglish:
      "Koi checkable factual claim nahi mila. Exact claim ya caption add karke try karo.",
    sources: [],
    serious: false,
    sensitive: false,
    category: null,
    fromCache: false,
    createdAt: new Date().toISOString(),
    checks: 1,
    demoMode: true,
    disclaimer: DISCLAIMER,
    disclaimerHinglish: DISCLAIMER_HINGLISH,
    warnings,
  };
}

export async function runPipeline(input: PipelineInput): Promise<PipelineResult> {
  const adapters = getAdapters();
  const warnings: string[] = [];
  let demoMode = false;
  let checkText = input.text;
  let transcript: string | undefined;

  if (input.inputType === "media") {
    try {
      const stt = adapters.stt ?? adapters.mock.stt;
      const transcription = await stt.transcribe({
        buffer: input.file?.buffer,
        fileName: input.file?.fileName,
        mimeType: input.file?.mimeType,
      });
      demoMode = demoMode || transcription.demo;
      checkText = transcription.text || input.text;
      transcript = transcription.text;
      if (transcription.warning) warnings.push(transcription.warning);
      if (!checkText) {
        return {
          result: emptyInputResult(input, input.language, warnings),
          cacheMiss: true,
        };
      }
    } catch (error) {
      console.warn("STT adapter failed, using mock:", error);
      const transcription = await adapters.mock.stt.transcribe({
        fileName: input.file?.fileName,
      });
      demoMode = true;
      checkText = transcription.text;
      transcript = transcription.text;
      if (transcription.warning) warnings.push(transcription.warning);
      warnings.push("Live transcription failed. Demo transcript used instead.");
    }
  }

  if (input.inputType === "reel") {
    if (input.text.trim().length >= 8) {
      checkText = input.text;
    } else if (input.sourceUrl) {
      const meta = await fetchReelMetadata(input.sourceUrl);
      if (meta.fetched && (meta.caption || meta.title)) {
        checkText = [meta.caption, meta.title, meta.author]
          .filter(Boolean)
          .join("\n");
        if (meta.author) {
          warnings.push(`Public oEmbed credited ${meta.author}. No login was used.`);
        }
      } else {
        checkText = `Instagram Reel content unavailable: ${input.sourceUrl}`;
        warnings.push(
          meta.warning ??
            "Instagram content could not be fetched. Paste the caption or transcript for a real check.",
        );
        demoMode = true;
      }
    } else {
      checkText = input.text;
      warnings.push(
        "Instagram content could not be fetched. Paste the caption or transcript for a real check.",
      );
      demoMode = true;
    }
  }

  const cacheKey = claimHash(checkText, input.language);
  const cached = await cacheGetByKey(cacheKey);
  if (cached && cached.result) {
    const age = Date.now() - new Date(cached.createdAt).getTime();
    if (age < 7 * 24 * 60 * 60 * 1000) {
      return {
        result: await cacheReuse(cached),
        cacheMiss: false,
      };
    }
  }

  const knownSeed = findSeedClaim(checkText);
  if (knownSeed) {
    const seedResult = buildSeedResult(knownSeed, input.language, 1);
    seedResult.inputType = input.inputType;
    seedResult.rawInput = input.text || knownSeed.text;
    seedResult.transcript = transcript;
    seedResult.warnings = warnings;
    seedResult.demoMode = true;
    const saved = await cacheSave({
      id: seedResult.id,
      cacheKey,
      normalized: normalizeClaim(checkText),
      language: input.language,
      inputType: input.inputType,
      rawInput: seedResult.rawInput,
      result: seedResult,
      serious: seedResult.serious,
      sensitive: seedResult.sensitive,
      category: seedResult.category,
      createdAt: new Date(),
    });
    return { result: { ...seedResult, checks: saved.checks }, cacheMiss: true };
  }

  let claims: string[] = [];
  try {
    const llm = adapters.llm ?? adapters.mock.llm;
    const extracted = await llm.extractClaims({
      text: checkText,
      language: input.language,
    });
    claims = extracted.claims;
    demoMode = demoMode || extracted.demo;
  } catch (error) {
    console.warn("Claim extraction failed, using mock:", error);
    const extracted = await adapters.mock.llm.extractClaims({
      text: checkText,
      language: input.language,
    });
    claims = extracted.claims;
    demoMode = true;
    warnings.push("Live claim extraction failed. Demo extraction used.");
  }

  if (claims.length === 0) {
    return {
      result: emptyInputResult(input, input.language, warnings),
      cacheMiss: true,
    };
  }

  const analysedClaims: ClaimAnalysis[] = [];
  for (const [index, claimText] of claims.slice(0, 5).entries()) {
    let sources: Source[] = [];
    try {
      const search = adapters.search ?? adapters.mock.search;
      const searchResult = await search.search(claimText, input.language);
      sources = searchResult.sources;
      demoMode = demoMode || searchResult.demo;
      if (searchResult.demo) {
        warnings.push(
          "Search adapter is in demo mode: sample evidence is being used.",
        );
      } else if (search.name === "wikipedia" && sources.length > 0) {
        warnings.push(
          "Live Wikipedia articles are attached. Open them to verify this yourself.",
        );
      }
      if (
        search.name !== "wikipedia" &&
        process.env.npm_lifecycle_event !== "test" &&
        process.env.NODE_ENV !== "test"
      ) {
        try {
          const wiki = await searchWikipedia(claimText, input.language);
          sources = uniqueSources([...sources, ...wiki]);
        } catch {
          // Tavily/mock evidence is enough if Wikipedia is unreachable.
        }
      }
      if (sources.length === 0) {
        const fallback = await adapters.mock.search.search(
          claimText,
          input.language,
        );
        sources = fallback.sources;
        demoMode = true;
        warnings.push("No live articles matched. Sample evidence is being used.");
      }
    } catch (error) {
      console.warn("Search failed, using mock:", error);
      const searchResult = await adapters.mock.search.search(
        claimText,
        input.language,
      );
      sources = searchResult.sources;
      demoMode = true;
      warnings.push("Live search failed. Demo evidence used.");
    }

    const sourcesForJudgement = uniqueSources(sources)
      .map(withSourceKind)
      .slice(0, 6);
    let judgement;
    try {
      const llm = adapters.llm ?? adapters.mock.llm;
      judgement = await llm.compareEvidence({
        claim: claimText,
        language: input.language,
        sources: sourcesForJudgement,
      });
      demoMode = demoMode || judgement.demo;
    } catch (error) {
      console.warn("Evidence comparison failed, using mock:", error);
      judgement = await adapters.mock.llm.compareEvidence({
        claim: claimText,
        language: input.language,
        sources: sourcesForJudgement,
      });
      demoMode = true;
      warnings.push("Live comparison failed. A cautious demo verdict was used.");
    }

    const independent = independentSourceCount(sourcesForJudgement);
    if (
      independent < 2 &&
      (judgement.verdict === "TRUE" || judgement.verdict === "FALSE")
    ) {
      judgement = {
        ...judgement,
        verdict: "UNVERIFIED",
        confidence: Math.min(judgement.confidence, 25),
        reasoning: `${judgement.reasoning} True or False needs at least two independent sources; this stays Unverified.`,
        reasoningHinglish: `${judgement.reasoningHinglish} True ya False ke liye kam se kam do independent sources chahiye; yeh Unverified rahega.`,
      };
    }

    const safety = classifySensitive(`${claimText} ${judgement.reasoning}`);
    analysedClaims.push({
      id: `claim-${index}-${shortHash(claimText).slice(0, 8)}`,
      text: claimText,
      verdict: judgement.verdict as Verdict,
      confidence: judgement.confidence,
      reasoning: judgement.reasoning,
      reasoningHinglish: judgement.reasoningHinglish,
      reelSays: judgement.reelSays,
      reelSaysHinglish: judgement.reelSaysHinglish,
      sourcesSay: judgement.sourcesSay,
      sourcesSayHinglish: judgement.sourcesSayHinglish,
      sources: sourcesForJudgement,
      sensitive: safety.serious,
      category: safety.category,
    });
  }

  if (detectPromptInjection(checkText)) {
    warnings.push(
      "Instructions inside the submitted text were ignored. It was treated only as claim data.",
    );
  }

  const aggregated = aggregateVerdict(analysedClaims);
  const inputSafety = classifySensitive(checkText);
  const serious =
    analysedClaims.some((claim) => claim.sensitive) || inputSafety.serious;
  const category =
    analysedClaims.find((claim) => claim.category)?.category ??
    inputSafety.category;
  const sources = allSources(analysedClaims).map(withSourceKind);
  const independent = independentSourceCount(sources);
  const disagree = sourcesDisagree(sources);
  const id = `check-${shortHash(`${checkText}::${Date.now()}`)}`;
  const result: AnalysisResult = {
    id,
    inputType: input.inputType,
    rawInput: input.text || input.sourceUrl || "",
    language: input.language,
    claims: analysedClaims,
    verdict: aggregated.verdict,
    confidence: aggregated.confidence,
    summary: aggregated.summary,
    summaryHinglish: aggregated.summaryHinglish,
    sources,
    serious,
    sensitive: serious,
    category,
    fromCache: false,
    createdAt: new Date().toISOString(),
    checks: 1,
    demoMode,
    disclaimer: DISCLAIMER,
    disclaimerHinglish: DISCLAIMER_HINGLISH,
    transcript,
    warnings: dedupe(warnings),
    independentSources: independent,
    sourcesDisagree: disagree,
    confidenceWhy: confidenceWhy({
      verdict: aggregated.verdict,
      confidence: aggregated.confidence,
      independent,
      fromCache: false,
      demoMode,
      disagree,
    }),
  };

  await cacheSave({
    id,
    cacheKey,
    normalized: normalizeClaim(checkText),
    language: input.language,
    inputType: input.inputType,
    rawInput: result.rawInput,
    result,
    serious,
    sensitive: serious,
    category,
    createdAt: new Date(result.createdAt),
  });

  return { result, cacheMiss: true };
}

function dedupe(values: string[]): string[] {
  return [...new Set(values)].slice(0, 6);
}

export function knownSeedCount(): number {
  return SEED_CLAIMS.length;
}

export function seedClaimFor(text: string) {
  const seed = findSeedClaim(text);
  return seed ? buildSeedClaimAnalysis(seed, "en") : null;
}
