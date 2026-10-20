export interface ReelMetadata {
  fetched: boolean;
  title?: string;
  caption?: string;
  author?: string;
  warning?: string;
}

const INSTAGRAM_HOSTS = new Set(["instagram.com", "www.instagram.com"]);

export function isPublicReelUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (!INSTAGRAM_HOSTS.has(url.hostname)) return false;
    return /^\/(reel|reels|p|tv)\//.test(url.pathname);
  } catch {
    return false;
  }
}

async function tryJson(url: string): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
      redirect: "follow",
    });
    if (!response.ok) return null;
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function fetchReelMetadata(reelUrl: string): Promise<ReelMetadata> {
  if (!isPublicReelUrl(reelUrl)) {
    return {
      fetched: false,
      warning: "Use a public Instagram Reel, post or TV link.",
    };
  }

  const encoded = encodeURIComponent(reelUrl);
  const endpoints = [
    `https://www.instagram.com/oembed/?url=${encoded}&omitscript=true`,
    `https://api.instagram.com/oembed?url=${encoded}&omitscript=true`,
  ];

  for (const endpoint of endpoints) {
    const data = await tryJson(endpoint);
    if (!data) continue;
    const title = typeof data.title === "string" ? data.title.trim() : "";
    const author =
      typeof data.author_name === "string" ? data.author_name.trim() : "";
    if (title || author) {
      return {
        fetched: true,
        title: title || undefined,
        caption: title || undefined,
        author: author || undefined,
      };
    }
  }

  return {
    fetched: false,
    warning:
      "Instagram did not share a public caption. Paste the caption or transcript — we never log in.",
  };
}
