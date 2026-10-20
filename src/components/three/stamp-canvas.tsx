"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useSettings } from "@/components/providers/settings-provider";
import { useSound, vibrate } from "@/components/providers/sound-provider";
import { use3dAllowed } from "@/lib/hooks/use-3d";
import { VERDICT_META } from "@/lib/constants";
import type { Verdict } from "@/lib/types";
import { VerdictStampFallback } from "@/components/results/verdict-stamp";

const StampScene = dynamic(() => import("./stamp-scene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[250px] items-center justify-center">
      <div className="h-24 w-40 animate-pulse rounded-2xl bg-clay/70" />
    </div>
  ),
});

export function StampCanvas({
  verdict,
  useSkin,
  serious,
}: {
  verdict: Verdict;
  useSkin: boolean;
  serious: boolean;
}) {
  const { settings } = useSettings();
  const { play } = useSound();
  const allowed = use3dAllowed();
  const played = useRef(false);
  const meta = VERDICT_META[verdict];
  const label = useSkin && !serious ? meta.skin : meta.official;

  useEffect(() => {
    if (played.current || !allowed || settings.reducedMotion) return;
    played.current = true;
    if (serious) return;
    const timeout = window.setTimeout(() => {
      play("thud");
      vibrate([40, 30, 80]);
    }, 540);
    return () => window.clearTimeout(timeout);
  }, [allowed, play, serious, settings.reducedMotion]);

  if (!allowed || settings.reducedMotion) {
    return (
      <VerdictStampFallback
        verdict={verdict}
        useSkin={useSkin}
        serious={serious}
      />
    );
  }

  return (
    <div
      className="relative h-[250px] w-full sm:h-[300px]"
      role="img"
      aria-label={`3D verdict stamp: ${meta.official}`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-4 inset-y-5 -rotate-1 rounded-xl border-2 border-line/15 bg-paper/80 paper-sheet sm:inset-x-10"
      />
      <StampScene verdict={verdict} />
      <p
        className="pointer-events-none absolute bottom-4 left-0 right-0 text-center font-display text-[clamp(1.4rem,5vw,2.4rem)] font-black uppercase tracking-tight"
        style={{ color: meta.deep }}
      >
        {label}
      </p>
    </div>
  );
}
