export type Verdict = "TRUE" | "FALSE" | "MISLEADING" | "UNVERIFIED";
export type Language = "en" | "hinglish";
export type InputType = "text" | "reel" | "media";
export type SeriousCategory =
  | "health"
  | "disaster"
  | "violence"
  | "religion"
  | "election"
  | null;

export type SourceKind =
  | "official"
  | "news"
  | "fact-checker"
  | "encyclopedia"
  | "social"
  | "unknown";

export interface Source {
  id: string;
  title: string;
  publisher: string;
  url: string;
  snippet: string;
  publishedAt?: string;
  credibility: "high" | "medium" | "unknown";
  kind?: SourceKind;
}

export interface ClaimAnalysis {
  id: string;
  text: string;
  verdict: Verdict;
  confidence: number;
  reasoning: string;
  reasoningHinglish: string;
  reelSays: string;
  reelSaysHinglish: string;
  sourcesSay: string;
  sourcesSayHinglish: string;
  sources: Source[];
  sensitive: boolean;
  category: SeriousCategory;
}

export interface AnalysisResult {
  id: string;
  inputType: InputType;
  rawInput: string;
  language: Language;
  claims: ClaimAnalysis[];
  verdict: Verdict;
  confidence: number;
  summary: string;
  summaryHinglish: string;
  sources: Source[];
  serious: boolean;
  sensitive: boolean;
  category: SeriousCategory;
  fromCache: boolean;
  createdAt: string;
  checks: number;
  demoMode: boolean;
  disclaimer: string;
  disclaimerHinglish: string;
  transcript?: string;
  warnings: string[];
  confidenceWhy?: string;
  sourcesDisagree?: boolean;
  independentSources?: number;
}

export interface VerifyRequestMeta {
  inputType: InputType;
  language: Language;
}

export interface TrendingItem {
  id: string;
  claim: string;
  verdict: Verdict;
  checks: number;
  category: SeriousCategory;
  sensitive: boolean;
  lastCheckedAt: string;
}

export interface DailyClaim {
  id: string;
  claim: string;
  verdict: Verdict;
  confidence: number;
  explanation: string;
  explanationHinglish: string;
  source: Source;
  category: SeriousCategory;
}

export interface ProviderStatus {
  ai: "live" | "mock";
  stt: "live" | "mock";
  search: "live" | "mock";
  cache: "postgres" | "memory";
}

export interface HistoryItem {
  id: string;
  claim: string;
  verdict: Verdict;
  confidence: number;
  checkedAt: string;
  language: Language;
  full?: AnalysisResult;
}
