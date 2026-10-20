"use client";

import clsx from "clsx";
import { VERDICT_META } from "@/lib/constants";
import type { Verdict } from "@/lib/types";
import {
  AlertIcon,
  CheckIcon,
  QuestionIcon,
  XIcon,
} from "@/components/icons";

export function VerdictIcon({
  verdict,
  className,
}: {
  verdict: Verdict;
  className?: string;
}) {
  const props = { className, width: 20, height: 20 };
  switch (verdict) {
    case "TRUE":
      return <CheckIcon {...props} />;
    case "FALSE":
      return <XIcon {...props} />;
    case "MISLEADING":
      return <AlertIcon {...props} />;
    default:
      return <QuestionIcon {...props} />;
  }
}

export function VerdictLabel({
  verdict,
  useSkin,
  serious,
  size = "md",
  className,
}: {
  verdict: Verdict;
  useSkin: boolean;
  serious?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const meta = VERDICT_META[verdict];
  const skinActive = useSkin && !serious;
  const label = skinActive ? meta.skin : meta.official;
  return (
    <span
      className={clsx(
        "inline-flex flex-col items-center justify-center rounded-xl border-2 font-display font-extrabold uppercase leading-none",
        size === "sm" && "px-2.5 py-1.5 text-[11px]",
        size === "md" && "px-3.5 py-2 text-sm",
        size === "lg" && "px-5 py-3 text-xl",
        className,
      )}
      style={{
        color: meta.text,
        backgroundColor: meta.bg,
        borderColor: meta.color,
        boxShadow: `0 3px 0 ${meta.deep}`,
      }}
    >
      <span className="inline-flex items-center gap-1.5">
        <VerdictIcon verdict={verdict} className="h-4 w-4" />
        {label}
      </span>
      {skinActive && (
        <span className="mt-1 text-[8px] font-extrabold tracking-[0.12em] opacity-70">
          Official: {meta.official}
        </span>
      )}
    </span>
  );
}

export function ConfidenceBar({
  confidence,
  verdict,
  showLabel = true,
}: {
  confidence: number;
  verdict: Verdict;
  showLabel?: boolean;
}) {
  const meta = VERDICT_META[verdict];
  return (
    <div className="w-full">
      {showLabel && (
        <div className="mb-1.5 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">
          <span>Confidence</span>
          <span>{confidence}%</span>
        </div>
      )}
      <div
        className="h-2.5 w-full overflow-hidden rounded-full border border-line/15"
        style={{ background: "rgb(var(--clay))" }}
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={confidence}
        aria-label={`Confidence ${confidence} percent`}
      >
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{
            width: `${Math.max(4, confidence)}%`,
            background: `repeating-linear-gradient(90deg, ${meta.color}, ${meta.color} 8px, ${meta.deep} 8px, ${meta.deep} 10px)`,
          }}
        />
      </div>
    </div>
  );
}

export function ConfidenceWhy({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <p className="mt-2 text-[10px] leading-relaxed text-muted">{text}</p>
  );
}
