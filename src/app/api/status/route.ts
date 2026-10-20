import { NextResponse } from "next/server";
import { getAdapters } from "@/lib/adapters";
import { cacheMode } from "@/lib/server/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const adapters = getAdapters();
  return NextResponse.json({
    providers: {
      ...adapters.status,
      cache: cacheMode(),
      demo: adapters.status.ai === "mock" || adapters.status.search === "mock",
    },
  });
}
