import { NextResponse } from "next/server";
import { z } from "zod";
import { logFeedback } from "@/lib/feedback";
import { getClientIp, rateLimit } from "@/lib/server/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  resultId: z.string().trim().min(3).max(120),
  verdict: z.enum(["TRUE", "FALSE", "MISLEADING", "UNVERIFIED"]),
  note: z.string().trim().max(280).optional(),
});

export async function POST(request: Request) {
  const limited = rateLimit(`feedback:${getClientIp(request)}`);
  if (!limited.allowed) {
    return NextResponse.json({ error: "Too many reports." }, { status: 429 });
  }
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid feedback." }, { status: 400 });
    }
    logFeedback(parsed.data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not record feedback." }, { status: 500 });
  }
}
