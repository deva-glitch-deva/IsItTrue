"use client";

import { VERDICT_META } from "./constants";
import type { AnalysisResult, Language } from "./types";

interface CardOptions {
  language: Language;
  useSkin: boolean;
  serious: boolean;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
): number {
  const words = text.split(/\s+/);
  let line = "";
  let lines = 0;
  let cursorY = y;
  for (let i = 0; i < words.length; i += 1) {
    const test = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cursorY);
      line = words[i];
      cursorY += lineHeight;
      lines += 1;
      if (lines >= maxLines) {
        if (i < words.length - 1) {
          let trimmed = `${line}…`;
          while (
            ctx.measureText(trimmed).width > maxWidth &&
            trimmed.length > 1
          ) {
            trimmed = `${trimmed.slice(0, -2)}…`;
          }
          ctx.fillText(trimmed, x, cursorY);
        }
        return cursorY;
      }
    } else {
      line = test;
    }
  }
  if (line) {
    ctx.fillText(line, x, cursorY);
    cursorY += lineHeight;
  }
  return cursorY;
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

export async function generateStoryCard(
  result: AnalysisResult,
  options: CardOptions,
): Promise<Blob> {
  try {
    await document.fonts.ready;
  } catch {
    // Font fallback is acceptable.
  }

  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable.");

  const meta = VERDICT_META[result.verdict];
  const claim = result.claims[0]?.text ?? result.rawInput;
  const skinActive = options.useSkin && !options.serious && !result.serious;
  const mainLabel = skinActive ? meta.skin : meta.official;
  const useHinglish = options.language === "hinglish";
  const siteUrl =
    typeof window !== "undefined" ? window.location.origin : "is-it-true.app";

  ctx.fillStyle = "#f5edde";
  ctx.fillRect(0, 0, 1080, 1920);

  ctx.fillStyle = "#f2e2c6";
  for (let y = 80; y < 1880; y += 46) {
    for (let x = 60; x < 1040; x += 46) {
      ctx.beginPath();
      ctx.arc(x, y, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.save();
  ctx.translate(840, -80);
  ctx.rotate(0.35);
  ctx.fillStyle = "#ff6a3d";
  ctx.fillRect(-220, -100, 600, 220);
  ctx.restore();
  ctx.save();
  ctx.translate(-50, 1810);
  ctx.rotate(-0.2);
  ctx.fillStyle = "#8ee4b8";
  ctx.fillRect(0, 0, 460, 180);
  ctx.restore();

  roundedRect(ctx, 64, 64, 952, 1792, 54);
  ctx.fillStyle = "#fdf7eb";
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = "rgba(56,45,35,0.16)";
  ctx.stroke();

  ctx.fillStyle = "#24170f";
  ctx.font = "800 40px 'Bricolage Grotesque Variable', sans-serif";
  ctx.fillText("IS IT", 112, 158);
  ctx.fillStyle = "#ff6a3d";
  ctx.fillText("TRUE?", 218, 158);

  ctx.fillStyle = "rgba(56,45,35,0.58)";
  ctx.font = "700 22px 'Manrope Variable', sans-serif";
  ctx.fillText("CASE FILE / FACT-CHECK RECEIPT", 112, 208);

  ctx.save();
  ctx.translate(540, 500);
  ctx.rotate(-0.055);
  ctx.lineWidth = 12;
  ctx.strokeStyle = meta.color;
  ctx.fillStyle = meta.bg;
  roundedRect(ctx, -370, -170, 740, 340, 32);
  ctx.fill();
  ctx.stroke();
  ctx.lineWidth = 4;
  ctx.strokeStyle = `${meta.color}66`;
  roundedRect(ctx, -348, -148, 696, 296, 22);
  ctx.stroke();
  ctx.fillStyle = meta.text;
  ctx.textAlign = "center";
  const labelSize = mainLabel.length > 8 ? 106 : 132;
  ctx.font = `900 ${labelSize}px 'Bricolage Grotesque Variable', sans-serif`;
  ctx.fillText(mainLabel.toUpperCase(), 0, 26);
  if (skinActive) {
    ctx.font = "800 24px 'Manrope Variable', sans-serif";
    ctx.fillStyle = `${meta.text}aa`;
    ctx.fillText(`OFFICIAL: ${meta.official.toUpperCase()}`, 0, 78);
  }
  ctx.fillStyle = `${meta.text}bb`;
  ctx.font = "800 21px 'Manrope Variable', sans-serif";
  ctx.fillText("AI-ASSISTED ESTIMATE", 0, 126);
  ctx.restore();

  ctx.textAlign = "left";
  ctx.fillStyle = "#24170f";
  ctx.font = "800 58px 'Bricolage Grotesque Variable', sans-serif";
  const claimEnd = wrapText(ctx, `“${claim}”`, 112, 790, 850, 72, 6);

  ctx.fillStyle = "rgba(56,45,35,0.72)";
  ctx.font = "700 26px 'Manrope Variable', sans-serif";
  ctx.fillText(
    useHinglish ? "Confidence" : "Confidence",
    112,
    Math.min(1310, claimEnd + 80),
  );
  const barY = Math.min(1330, claimEnd + 104);
  roundedRect(ctx, 112, barY, 856, 22, 11);
  ctx.fillStyle = "#e6d7c0";
  ctx.fill();
  roundedRect(
    ctx,
    112,
    barY,
    Math.max(28, (856 * result.confidence) / 100),
    22,
    11,
  );
  ctx.fillStyle = meta.color;
  ctx.fill();
  ctx.fillStyle = meta.text;
  ctx.font = "800 28px 'Manrope Variable', sans-serif";
  ctx.fillText(`${result.confidence}%`, 112, barY + 62);
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(56,45,35,0.62)";
  ctx.fillText(`${result.sources.length} sources`, 968, barY + 62);
  ctx.textAlign = "left";

  ctx.fillStyle = "rgba(56,45,35,0.1)";
  ctx.fillRect(112, 1500, 856, 2);
  ctx.fillStyle = "rgba(56,45,35,0.68)";
  ctx.font = "700 24px 'Manrope Variable', sans-serif";
  ctx.fillText("AI-assisted estimate, not absolute truth.", 112, 1570);
  ctx.fillText("Sources are on the case file. Check them yourself.", 112, 1612);

  ctx.fillStyle = "#24170f";
  ctx.font = "800 30px 'Bricolage Grotesque Variable', sans-serif";
  ctx.fillText("is it true?", 112, 1760);
  ctx.fillStyle = "rgba(56,45,35,0.55)";
  ctx.font = "700 22px 'Manrope Variable', sans-serif";
  ctx.fillText(siteUrl.replace(/^https?:\/\//, ""), 112, 1798);

  if (!options.serious && !result.serious) {
    ctx.save();
    ctx.translate(812, 1738);
    ctx.rotate(0.08);
    ctx.fillStyle = "#ffe28a";
    ctx.fillRect(-132, -44, 264, 88);
    ctx.fillStyle = "#675000";
    ctx.textAlign = "center";
    ctx.font = "800 20px 'Manrope Variable', sans-serif";
    ctx.fillText("GUESS FIRST NEXT TIME", 0, 7);
    ctx.restore();
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Could not create image."));
      },
      "image/png",
      1,
    );
  });
}

export async function generateDailyScoreCard(input: {
  score: number;
  total?: number;
  dayKey: string;
  siteUrl: string;
  results?: boolean[];
}): Promise<Blob> {
  try {
    await document.fonts.ready;
  } catch {
    // Font fallback is acceptable.
  }

  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable.");

  const total = input.total ?? 5;
  const score = Math.max(0, Math.min(total, input.score));
  const results =
    input.results && input.results.length === total
      ? input.results
      : Array.from({ length: total }, (_, index) => index < score);

  ctx.fillStyle = "#140f0b";
  ctx.fillRect(0, 0, 1080, 1920);
  ctx.fillStyle = "#ff6a3d";
  ctx.fillRect(0, 0, 1080, 28);
  ctx.fillStyle = "#ffe28a";
  ctx.fillRect(0, 1892, 1080, 28);

  ctx.fillStyle = "#f5edde";
  ctx.font = "800 36px 'Bricolage Grotesque Variable', sans-serif";
  ctx.fillText("IS IT TRUE?", 96, 160);
  ctx.fillStyle = "#ffe28a";
  ctx.font = "800 28px 'Manrope Variable', sans-serif";
  ctx.fillText("CAP OR NO CAP", 96, 210);

  ctx.fillStyle = "#fdf7eb";
  roundedRect(ctx, 80, 280, 920, 980, 48);
  ctx.fill();

  ctx.fillStyle = "#24170f";
  ctx.font = "800 34px 'Manrope Variable', sans-serif";
  ctx.fillText(input.dayKey, 120, 360);
  ctx.font = "900 210px 'Bricolage Grotesque Variable', sans-serif";
  ctx.fillText(`${score}`, 120, 620);
  ctx.fillStyle = "#ff6a3d";
  ctx.font = "800 72px 'Bricolage Grotesque Variable', sans-serif";
  ctx.fillText(`/ ${total}`, 420, 600);

  ctx.fillStyle = "#24170f";
  ctx.font = "800 42px 'Bricolage Grotesque Variable', sans-serif";
  const headline =
    score >= 4
      ? "Sharp eye."
      : score >= 2
        ? "Solid instincts."
        : "The feed got you.";
  ctx.fillText(headline, 120, 720);

  ctx.fillStyle = "rgba(56,45,35,0.7)";
  ctx.font = "700 26px 'Manrope Variable', sans-serif";
  ctx.fillText("Five claims. One daily board. Beat this.", 120, 780);

  const boxW = 132;
  const gap = 28;
  const startX = 120;
  results.forEach((ok, index) => {
    const x = startX + index * (boxW + gap);
    roundedRect(ctx, x, 860, boxW, 132, 22);
    ctx.fillStyle = ok ? "#d9f7e8" : "#ffe0dc";
    ctx.fill();
    ctx.strokeStyle = ok ? "#1fae6a" : "#ef4444";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = ok ? "#064d2d" : "#6e1212";
    ctx.font = "900 54px 'Bricolage Grotesque Variable', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(ok ? "Y" : "N", x + boxW / 2, 948);
    ctx.textAlign = "left";
  });

  ctx.fillStyle = "rgba(56,45,35,0.55)";
  ctx.font = "700 22px 'Manrope Variable', sans-serif";
  ctx.fillText("Play coins only. No cash-out. No real-world value.", 120, 1080);
  ctx.fillText("AI-assisted estimate, not absolute truth.", 120, 1124);

  ctx.fillStyle = "#f5edde";
  ctx.font = "800 34px 'Bricolage Grotesque Variable', sans-serif";
  ctx.fillText("Challenge a friend", 96, 1420);
  ctx.fillStyle = "rgba(245,237,222,0.7)";
  ctx.font = "700 24px 'Manrope Variable', sans-serif";
  ctx.fillText(input.siteUrl.replace(/^https?:\/\//, ""), 96, 1470);
  ctx.fillText(`${input.siteUrl.replace(/\/$/, "")}/daily?score=${score}&total=${total}`, 96, 1514);

  ctx.save();
  ctx.translate(820, 1680);
  ctx.rotate(-0.12);
  ctx.fillStyle = "#8ee4b8";
  roundedRect(ctx, -160, -70, 320, 140, 24);
  ctx.fill();
  ctx.fillStyle = "#064d2d";
  ctx.textAlign = "center";
  ctx.font = "800 28px 'Bricolage Grotesque Variable', sans-serif";
  ctx.fillText("BEAT THIS", 0, 12);
  ctx.restore();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Could not create image."));
      },
      "image/png",
      1,
    );
  });
}

export function shareText(
  result: AnalysisResult,
  language: Language,
  siteUrl: string,
): string {
  const meta = VERDICT_META[result.verdict];
  const claim = result.claims[0]?.text ?? result.rawInput;
  const label = language === "hinglish" ? "Verdict" : "Verdict";
  return [
    `Is It True? — ${label}: ${meta.official} (${result.confidence}%)`,
    `“${claim}”`,
    result.sources.length > 0
      ? `Sources: ${result.sources
          .slice(0, 3)
          .map((source) => source.publisher)
          .join(", ")}`
      : "Sources were too thin to call.",
    "AI-assisted estimate, not absolute truth.",
    `${siteUrl}/results/${result.id}`,
  ].join("\n");
}

export function familyReply(result: AnalysisResult, siteUrl: string): string {
  const claim = result.claims[0]?.text ?? result.rawInput;
  const sourceLines = result.sources
    .slice(0, 3)
    .map((source, index) => `${index + 1}. ${source.publisher} — ${source.url}`)
    .join("\n");
  return [
    "Thanks for sharing this. I checked it before forwarding, so here is what I found.",
    "",
    `Claim: “${claim}”`,
    `Verdict: ${VERDICT_META[result.verdict].official} (${result.confidence}% confidence)`,
    "",
    result.claims[0]?.reasoning ?? result.summary,
    "",
    "Sources:",
    sourceLines || "No direct sources were available, so treat it as unverified.",
    "",
    "This is an AI-assisted estimate, not absolute truth. Worth a read before we pass it on.",
    `${siteUrl}/results/${result.id}`,
  ].join("\n");
}

export async function shareCard(blob: Blob, text: string): Promise<"shared" | "downloaded"> {
  const file = new File([blob], "is-it-true.png", { type: "image/png" });
  const nav = navigator as Navigator & {
    canShare?: (data?: ShareData) => boolean;
  };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({
        files: [file],
        title: "Is It True?",
        text,
      });
      return "shared";
    } catch (error) {
      if ((error as DOMException)?.name === "AbortError") return "shared";
    }
  }
  downloadBlob(blob, "is-it-true-story.png");
  await copyToClipboard(text);
  return "downloaded";
}

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
