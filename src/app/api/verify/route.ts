import { NextResponse } from "next/server";
import { MAX_FILE_BYTES, MAX_INPUT } from "@/lib/constants";
import { runPipeline } from "@/lib/server/pipeline";
import { getClientIp, rateLimit } from "@/lib/server/rate-limit";
import { languageSchema, verifySchema } from "@/lib/validation";
import type { InputType, Language } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function errorJson(
  message: string,
  status: number,
  extras?: Record<string, unknown>,
) {
  return NextResponse.json({ error: message, ...extras }, { status });
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`verify:${ip}`);
  if (!limited.allowed) {
    return errorJson("Too many checks. Try again shortly.", 429, {
      retryAfter: limited.retryAfter,
    });
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    let payload: Record<string, unknown> = {};
    let fileBuffer: ArrayBuffer | undefined;
    let file: { fileName: string; mimeType: string } | undefined;

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      payload = {
        mode: form.get("mode"),
        language: form.get("language"),
        claim: form.get("claim") || undefined,
        reelUrl: form.get("reelUrl") || undefined,
        caption: form.get("caption") || undefined,
      };
      const uploaded = form.get("file");
      if (uploaded && uploaded instanceof File) {
        if (uploaded.size === 0) {
          return errorJson("The file is empty.", 400);
        }
        if (uploaded.size > MAX_FILE_BYTES) {
          return errorJson("File is larger than 25 MB.", 413);
        }
        if (!uploaded.type.startsWith("video/") && !uploaded.type.startsWith("audio/")) {
          return errorJson("Only video or audio files are supported.", 415);
        }
        fileBuffer = await uploaded.arrayBuffer();
        file = {
          fileName: uploaded.name.slice(0, 200),
          mimeType: uploaded.type,
        };
        payload.fileName = file.fileName;
        payload.mimeType = file.mimeType;
      }
    } else {
      const body = (await request.json()) as Record<string, unknown>;
      payload = body;
    }

    const parsed = verifySchema.safeParse(payload);
    if (!parsed.success) {
      return errorJson("Input validation failed.", 400, {
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const data = parsed.data;
    const mode = data.mode as InputType;
    const language = languageSchema.parse(data.language) as Language;

    if (mode === "media" && !fileBuffer) {
      return errorJson("A media file is required for this mode.", 400);
    }

    const text =
      mode === "text"
        ? (data.claim ?? "")
        : mode === "reel"
          ? (data.caption ?? "")
          : "";

    if (text.length > MAX_INPUT) {
      return errorJson("Input is too long.", 413);
    }

    const { result, cacheMiss } = await runPipeline({
      inputType: mode,
      language,
      text,
      sourceUrl: data.reelUrl,
      file:
        fileBuffer && file
          ? { buffer: fileBuffer, fileName: file.fileName, mimeType: file.mimeType }
          : undefined,
    });

    return NextResponse.json(
      { result, cacheMiss },
      {
        headers: {
          "X-RateLimit-Remaining": String(limited.remaining),
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Verify route failed:", error);
    return errorJson("Something went wrong while checking that claim.", 500);
  }
}
