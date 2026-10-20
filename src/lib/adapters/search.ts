import { classifySourceKind } from "../sources";
import type { Language, Source } from "../types";
import type { SearchAdapter, SearchResult } from "./types";

export function hasSearch(): boolean {
  return Boolean(process.env.SEARCH_API_KEY);
}

const HIGH_TRUST_DOMAINS = [
  "who.int",
  "nasa.gov",
  "nih.gov",
  "nhs.uk",
  "cdc.gov",
  "reuters.com",
  "apnews.com",
  "bbc.co.uk",
  "bbc.com",
  "britannica.com",
  "cancerresearchuk.org",
  "mayoclinic.org",
  "snopes.com",
  "fullfact.org",
  "factcheck.afp.com",
  "pib.gov.in",
  "europa.eu",
  "un.org",
];

function publisherFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const parts = host.split(".");
    const core = parts.length > 2 ? parts[parts.length - 2] : parts[0];
    return core.charAt(0).toUpperCase() + core.slice(1);
  } catch {
    return "Unknown publisher";
  }
}

function credibilityFor(url: string): Source["credibility"] {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return HIGH_TRUST_DOMAINS.some(
      (domain) => host === domain || host.endsWith(`.${domain}`),
    )
      ? "high"
      : "medium";
  } catch {
    return "unknown";
  }
}

export class TavilySearchAdapter implements SearchAdapter {
  readonly name = "tavily";

  async search(query: string, language: Language): Promise<SearchResult> {
    if (!process.env.SEARCH_API_KEY) {
      throw new Error("No search key configured.");
    }
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.SEARCH_API_KEY,
        query:
          language === "hinglish"
            ? `${query} fact check`
            : `${query} fact check evidence`,
        search_depth: process.env.TAVILY_SEARCH_DEPTH || "basic",
        max_results: 6,
        include_answer: false,
        include_raw_content: false,
      }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) {
      throw new Error(`Search failed with ${response.status}.`);
    }
    const data = (await response.json()) as {
      results?: Array<{
        title?: string;
        url?: string;
        content?: string;
        published_date?: string;
        score?: number;
      }>;
    };
    const sources: Source[] = (data.results ?? [])
      .filter((result) => Boolean(result.url && result.title))
      .slice(0, 6)
      .map((result, index) => {
        const url = result.url as string;
        return {
          id: `live-${index}-${Math.abs(url.length * 31)}`,
          title: result.title as string,
          publisher: publisherFromUrl(url),
          url,
          snippet: (result.content || "No snippet available.").slice(0, 700),
          publishedAt: result.published_date,
          credibility: credibilityFor(url),
          kind: classifySourceKind(url),
        };
      });
    return { sources, demo: false };
  }
}
