import { NextResponse } from "next/server";
import { listTrending } from "@/lib/server/cache";
import { trendQuerySchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = trendQuerySchema.safeParse({
    lang: url.searchParams.get("lang") ?? "en",
    limit: url.searchParams.get("limit") ?? 10,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query." }, { status: 400 });
  }
  try {
    const items = await listTrending(parsed.data.lang, parsed.data.limit);
    return NextResponse.json(
      { items },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Trending route failed:", error);
    return NextResponse.json({ items: [] });
  }
}
