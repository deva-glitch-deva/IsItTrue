import { NextResponse } from "next/server";
import { fetchReelMetadata, isPublicReelUrl } from "@/lib/server/reel";
import { getClientIp, rateLimit } from "@/lib/server/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const limited = rateLimit(`reel:${getClientIp(request)}`);
  if (!limited.allowed) {
    return NextResponse.json({ error: "Slow down." }, { status: 429 });
  }
  const url = new URL(request.url).searchParams.get("url") ?? "";
  if (!isPublicReelUrl(url)) {
    return NextResponse.json(
      {
        fetched: false,
        warning: "Use a public Instagram Reel, post or TV link.",
      },
      { status: 400 },
    );
  }
  const meta = await fetchReelMetadata(url);
  return NextResponse.json(meta);
}
