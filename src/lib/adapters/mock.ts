import { findSeedClaim, SEED_CLAIMS } from "../seed-claims";
import { splitSentences } from "../text";
import type { Language, Source, Verdict } from "../types";
import type {
  CompareInput,
  ExtractedClaims,
  ExtractInput,
  Judgement,
  LLMAdapter,
  SearchAdapter,
  SearchResult,
  STTAdapter,
  TranscribeInput,
  Transcription,
} from "./types";

const GENERIC_SOURCES: Source[] = [
  {
    id: "generic-reuters",
    title: "Reuters Fact Check",
    publisher: "Reuters",
    url: "https://www.reuters.com/fact-check/",
    snippet:
      "We searched the Reuters fact-check archive and found no direct match for this exact claim.",
    credibility: "high",
  },
  {
    id: "generic-fullfact",
    title: "Full Fact",
    publisher: "Full Fact",
    url: "https://fullfact.org/",
    snippet:
      "Full Fact's public archive returned no directly relevant fact check for the claim as worded.",
    credibility: "high",
  },
  {
    id: "generic-afp",
    title: "AFP Fact Check",
    publisher: "AFP",
    url: "https://factcheck.afp.com/",
    snippet:
      "The AFP fact-check index has no entry that verifies this specific claim. Evidence is thin.",
    credibility: "high",
  },
];

function genericSources(claim: string): Source[] {
  return GENERIC_SOURCES.map((source) => ({
    ...source,
    id: `${source.id}-${Math.abs(hashString(claim)).toString(36)}`,
    snippet: `${source.snippet} Query: "${claim.slice(0, 120)}"`,
  }));
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export class MockLLMAdapter implements LLMAdapter {
  readonly name = "mock-llm";

  async extractClaims(input: ExtractInput): Promise<ExtractedClaims> {
    const known = findSeedClaim(input.text);
    if (known) {
      return { claims: [known.text], demo: true };
    }
    const sentences = splitSentences(input.text, 5);
    return {
      claims: sentences.length > 0 ? sentences : [input.text.trim().slice(0, 300)],
      demo: true,
    };
  }

  async compareEvidence(input: CompareInput): Promise<Judgement> {
    const known = findSeedClaim(input.claim);
    if (known) {
      return {
        verdict: known.verdict,
        confidence: known.confidence,
        reasoning: known.reasoning,
        reasoningHinglish: known.reasoningHinglish,
        reelSays: known.reelSays,
        reelSaysHinglish: known.reelSaysHinglish,
        sourcesSay: known.sourcesSay,
        sourcesSayHinglish: known.sourcesSayHinglish,
        demo: true,
      };
    }

    return {
      verdict: "UNVERIFIED",
      confidence: 24,
      reasoning:
        "We found no strong, directly relevant evidence for this exact claim. That is not proof it is false. The claim stays Unverified until a credible source can be traced.",
      reasoningHinglish:
        "Is exact claim ke liye koi strong, direct evidence nahi mila. Iska matlab false nahi hai. Jab tak credible source trace nahi hota, claim Unverified rahega.",
      reelSays: input.claim,
      reelSaysHinglish: input.claim,
      sourcesSay:
        "Public fact-check archives and search results did not surface a direct match. The available material was not strong enough to support a verdict either way.",
      sourcesSayHinglish:
        "Public fact-check archives aur search results mein direct match nahi mila. Available material kisi bhi verdict ke liye kaafi strong nahi tha.",
      demo: true,
    };
  }
}

const DEMO_TRANSCRIPTS = [
  {
    text: "Drinking hot lemon water cures cancer. It alkalises your body and kills the cancer cells.",
    warning:
      "Demo transcription. Add STT_API_KEY for real speech-to-text. No media was stored.",
  },
  {
    text: "The Eiffel Tower was originally intended to be a temporary structure for the World's Fair.",
    warning:
      "Demo transcription. Add STT_API_KEY for real speech-to-text. No media was stored.",
  },
  {
    text: "Eating carrots improves your night vision. That is why pilots ate them in the war.",
    warning:
      "Demo transcription. Add STT_API_KEY for real speech-to-text. No media was stored.",
  },
];

export class MockSTTAdapter implements STTAdapter {
  readonly name = "mock-stt";

  async transcribe(input: TranscribeInput): Promise<Transcription> {
    if (input.sourceUrl) {
      return {
        text: "",
        demo: true,
        warning:
          "Instagram content could not be fetched. Paste the caption or transcript for a real check.",
      };
    }
    const index = Math.abs(hashString(input.fileName ?? "clip")) %
      DEMO_TRANSCRIPTS.length;
    return {
      ...DEMO_TRANSCRIPTS[index],
      demo: true,
    };
  }
}

export class MockSearchAdapter implements SearchAdapter {
  readonly name = "mock-search";

  async search(query: string, language: Language): Promise<SearchResult> {
    void language;
    const known = findSeedClaim(query);
    if (known) {
      return { sources: known.sources, demo: true };
    }
    return { sources: genericSources(query), demo: true };
  }
}

export function mockSourcesForClaim(claim: string): Source[] {
  const known = findSeedClaim(claim);
  return known ? known.sources : genericSources(claim);
}

export function demoSeedSummary() {
  return SEED_CLAIMS.map((seed) => ({
    slug: seed.slug,
    text: seed.text,
    verdict: seed.verdict as Verdict,
  }));
}
