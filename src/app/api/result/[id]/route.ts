import { NextResponse } from "next/server";
import { cacheGetById } from "@/lib/server/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id || id.length > 120) {
    return NextResponse.json({ error: "Invalid case id." }, { status: 400 });
  }
  try {
    const record = await cacheGetById(id);
    if (!record) {
      return NextResponse.json({ error: "Case file not found." }, { status: 404 });
    }
    return NextResponse.json(
      {
        result: {
          ...(record.result as object),
          checks: record.checks,
          createdAt: record.createdAt,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Result route failed:", error);
    return NextResponse.json({ error: "Case file unavailable." }, { status: 500 });
  }
}
