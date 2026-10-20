import type { Language, Source, Verdict } from "../types";

export interface ExtractInput {
  text: string;
  language: Language;
}

export interface ExtractedClaims {
  claims: string[];
  demo: boolean;
}

export interface Judgement {
  verdict: Verdict;
  confidence: number;
  reasoning: string;
  reasoningHinglish: string;
  reelSays: string;
  reelSaysHinglish: string;
  sourcesSay: string;
  sourcesSayHinglish: string;
  demo: boolean;
}

export interface CompareInput {
  claim: string;
  language: Language;
  sources: Source[];
}

export interface TranscribeInput {
  buffer?: ArrayBuffer;
  fileName?: string;
  mimeType?: string;
  sourceUrl?: string;
}

export interface Transcription {
  text: string;
  demo: boolean;
  warning?: string;
}

export interface SearchResult {
  sources: Source[];
  demo: boolean;
}

export interface LLMAdapter {
  readonly name: string;
  extractClaims(input: ExtractInput): Promise<ExtractedClaims>;
  compareEvidence(input: CompareInput): Promise<Judgement>;
}

export interface STTAdapter {
  readonly name: string;
  transcribe(input: TranscribeInput): Promise<Transcription>;
}

export interface SearchAdapter {
  readonly name: string;
  search(query: string, language: Language): Promise<SearchResult>;
}
