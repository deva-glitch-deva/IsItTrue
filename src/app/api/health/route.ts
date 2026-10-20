import { NextResponse } from "next/server";
import { getAdapters } from "@/lib/adapters";
import { cacheMode, memoryCacheSize } from "@/lib/server/cache";
import { knownSeedCount } from "@/lib/server/pipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const adapters = getAdapters();
  return NextResponse.json({
    ok: true,
    app: "is-it-true",
    time: new Date().toISOString(),
    seeds: knownSeedCount(),
    cache: {
      mode: cacheMode(),
      memorySize: memoryCacheSize(),
    },
    providers: adapters.status,
  });
}
