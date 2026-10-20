import type { Source, SourceKind, Verdict } from "./types";

const OFFICIAL_HOSTS = [
  "who.int",
  "nasa.gov",
  "nih.gov",
  "nhs.uk",
  "cdc.gov",
  "pib.gov.in",
  "europa.eu",
  "un.org",
  "gov.uk",
  "toureiffel.paris",
  "britannica.com",
  "cancerresearchuk.org",
  "mayoclinic.org",
];

const NEWS_HOSTS = [
  "reuters.com",
  "apnews.com",
  "bbc.co.uk",
  "bbc.com",
  "nytimes.com",
  "theguardian.com",
  "npr.org",
  "aljazeera.com",
  "indianexpress.com",
  "thehindu.com",
];

const FACT_CHECK_HOSTS = [
  "snopes.com",
  "fullfact.org",
  "factcheck.afp.com",
  "politifact.com",
  "factcheck.org",
  "boomlive.in",
  "altnews.in",
  "factly.in",
];

const SOCIAL_HOSTS = [
  "instagram.com",
  "twitter.com",
  "x.com",
  "facebook.com",
  "tiktok.com",
  "youtube.com",
  "reddit.com",
  "threads.net",
];

export function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function matchesHost(host: string, list: string[]): boolean {
  return list.some((domain) => host === domain || host.endsWith(`.${domain}`));
}

export function classifySourceKind(url: string): SourceKind {
  const host = hostnameOf(url);
  if (!host) return "unknown";
  if (host.endsWith(".gov") || host.endsWith(".gov.in") || matchesHost(host, OFFICIAL_HOSTS)) {
    return "official";
  }
  if (matchesHost(host, FACT_CHECK_HOSTS) || host.includes("factcheck") || host.includes("fact-check")) {
    return "fact-checker";
  }
  if (matchesHost(host, NEWS_HOSTS)) return "news";
  if (host === "wikipedia.org" || host.endsWith(".wikipedia.org") || host === "wikimedia.org") {
    return "encyclopedia";
  }
  if (matchesHost(host, SOCIAL_HOSTS)) return "social";
  return "unknown";
}

export function withSourceKind(source: Source): Source {
  return { ...source, kind: source.kind ?? classifySourceKind(source.url) };
}

export function independentSourceCount(sources: Source[]): number {
  const hosts = new Set(
    sources.map((source) => hostnameOf(source.url)).filter(Boolean),
  );
  return hosts.size;
}

export function sourcesDisagree(sources: Source[]): boolean {
  if (sources.length < 2) return false;
  const kinds = new Set(sources.map((source) => withSourceKind(source).kind));
  const hasSocial = kinds.has("social");
  const hasTrusted =
    kinds.has("official") ||
    kinds.has("news") ||
    kinds.has("fact-checker") ||
    kinds.has("encyclopedia");
  return hasSocial && hasTrusted;
}

export function confidenceWhy(input: {
  verdict: Verdict;
  confidence: number;
  independent: number;
  fromCache: boolean;
  demoMode: boolean;
  disagree: boolean;
}): string {
  const parts: string[] = [];
  if (input.independent >= 2) {
    parts.push(
      `${input.independent} independent sources support this ${input.confidence}% read.`,
    );
  } else if (input.independent === 1) {
    parts.push(
      "Only one independent source was found, so confidence stays low.",
    );
  } else {
    parts.push("No independent public source was found for this exact claim.");
  }
  if (input.verdict === "UNVERIFIED") {
    parts.push("Thin or mixed evidence is labelled Unverified, never guessed.");
  }
  if (input.disagree) {
    parts.push("Sources do not fully agree.");
  }
  if (input.fromCache) {
    parts.push("Reused from a check less than 7 days old.");
  }
  if (input.demoMode) {
    parts.push("Demo evidence is standing in for live providers.");
  }
  return parts.join(" ");
}
