"use client";

import dynamic from "next/dynamic";
import { useSettings } from "@/components/providers/settings-provider";
import { use3dAllowed } from "@/lib/hooks/use-3d";
import type { Verdict } from "@/lib/types";
import { VERDICT_META } from "@/lib/constants";

const GaugeScene = dynamic(() => import("./gauge-scene"), {
  ssr: false,
  loading: () => <GaugeFallback />,
});

export function GaugeFallback({
  settled = false,
  verdict = "UNVERIFIED",
}: {
  settled?: boolean;
  verdict?: Verdict;
}) {
  const meta = VERDICT_META[verdict];
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div
        className="relative h-40 w-64 overflow-hidden rounded-t-full border-[10px] border-b-0 border-clay bg-cream shadow-inner sm:h-52 sm:w-80"
        aria-hidden="true"
      >
        <div className="absolute inset-x-5 top-6 grid grid-cols-6 gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <span
              key={index}
              className="block h-3 w-0.5 justify-self-center rounded bg-muted/40"
            />
          ))}
        </div>
        <div
          className="absolute bottom-0 left-1/2 h-1.5 origin-left rounded-full bg-false transition-transform duration-700"
          style={{
            width: "38%",
            transform: settled
              ? `rotate(${verdict === "TRUE" ? -35 : verdict === "FALSE" ? 35 : verdict === "MISLEADING" ? 8 : 20}deg)`
              : undefined,
            animation: settled ? undefined : "wobble 0.5s ease-in-out infinite",
          }}
        />
        <div className="absolute bottom-[-14px] left-1/2 h-7 w-7 -translate-x-1/2 rounded-full border-4 border-butter bg-misleading" />
        <div
          className="absolute bottom-2 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full border border-line/20"
          style={{ background: meta.color }}
        />
      </div>
    </div>
  );
}

export function GaugeCanvas({
  settled = false,
  verdict = "UNVERIFIED",
}: {
  settled?: boolean;
  verdict?: Verdict;
}) {
  const { settings } = useSettings();
  const allowed = use3dAllowed();

  return (
    <div
      className="h-full w-full"
      role="img"
      aria-label={`Animated lie-detector gauge currently showing ${settled ? VERDICT_META[verdict].official : "an unsettled measurement"}`}
    >
      {allowed && !settings.reducedMotion ? (
        <GaugeScene settled={settled} verdict={verdict} />
      ) : (
        <GaugeFallback settled={settled} verdict={verdict} />
      )}
    </div>
  );
}
