import { classifySourceKind } from "../sources";
import type { Language, Source } from "../types";
import type { SearchAdapter, SearchResult } from "./types";

const WIKI_UA =
  "IsItTrue/1.0 (https://is-it-true.app; fact-check demo; wikipedia.org)";

export interface WikiSearchItem {
  title?: string;
  snippet?: string;
  pageid?: number;
  timestamp?: string;
}

interface WikiSummary {
  title?: string;
  extract?: string;
  description?: string;
  content_urls?: { desktop?: { page?: string } };
  timestamp?: string;
}

export function stripWikiHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function wikiHost(_language: Language): string {
  void _language;
  return "https://en.wikipedia.org";
}

export function wikiPageUrl(host: string, title: string): string {
  return `${host}/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`;
}

export function mapWikipediaHits(
  hits: WikiSearchItem[],
  host: string,
): Source[] {
  return hits
    .filter((hit) => Boolean(hit.title))
    .slice(0, 4)
    .map((hit, index) => {
      const title = hit.title as string;
      const url = wikiPageUrl(host, title);
      return {
        id: `wiki-${hit.pageid ?? index}-${title.slice(0, 24)}`,
        title,
        publisher: "Wikipedia",
        url,
        snippet:
          stripWikiHtml(hit.snippet ?? "") ||
          "Open this Wikipedia article to verify the claim yourself.",
        publishedAt: hit.timestamp,
        credibility: "high" as const,
        kind: classifySourceKind(url),
      } satisfies Source;
    });
}

export async function searchWikipedia(
  query: string,
  language: Language,
): Promise<Source[]> {
  const host = wikiHost(language);
  const searchUrl = new URL(`${host}/w/api.php`);
  searchUrl.searchParams.set("action", "query");
  searchUrl.searchParams.set("list", "search");
  searchUrl.searchParams.set("srsearch", query.slice(0, 180));
  searchUrl.searchParams.set("srlimit", "5");
  searchUrl.searchParams.set("srprop", "snippet|timestamp");
  searchUrl.searchParams.set("format", "json");
  searchUrl.searchParams.set("origin", "*");

  const response = await fetch(searchUrl, {
    headers: { "User-Agent": WIKI_UA, Accept: "application/json" },
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error(`Wikipedia search ${response.status}`);
  const data = (await response.json()) as {
    query?: { search?: WikiSearchItem[] };
  };
  const hits = data.query?.search ?? [];
  const sources = mapWikipediaHits(hits, host);
  if (sources.length === 0) return [];

  return Promise.all(
    sources.map(async (source) => {
      try {
        const title = source.title;
        const summaryRes = await fetch(
          `${host}/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, "_"))}`,
          {
            headers: { "User-Agent": WIKI_UA, Accept: "application/json" },
            signal: AbortSignal.timeout(8_000),
          },
        );
        if (!summaryRes.ok) return source;
        const summary = (await summaryRes.json()) as WikiSummary;
        return {
          ...source,
          url: summary.content_urls?.desktop?.page || source.url,
          snippet: summary.extract
            ? summary.extract.slice(0, 700)
            : source.snippet,
          kind: classifySourceKind(summary.content_urls?.desktop?.page || source.url),
        };
      } catch {
        return source;
      }
    }),
  );
}

export class WikipediaSearchAdapter implements SearchAdapter {
  readonly name = "wikipedia";

  async search(query: string, language: Language): Promise<SearchResult> {
    const sources = await searchWikipedia(query, language);
    return { sources, demo: false };
  }
}
