"use client";

import Link from "next/link";
import { useSettings } from "@/components/providers/settings-provider";
import { useCoins } from "@/components/providers/coins-provider";
import { gullibilityBadge } from "@/lib/coins";
import { GameIcon } from "@/components/icons";

const BADGE_KEYS = {
  sharp: "gullibility.sharp",
  skeptical: "gullibility.skeptical",
  balanced: "gullibility.balanced",
  trusting: "gullibility.trusting",
  open: "gullibility.open",
} as const;

export function GullibilityView() {
  const { t, settings } = useSettings();
  const { gullibilityScore, betsPlaced, correctCalls } = useCoins();
  const badge = gullibilityBadge(gullibilityScore);
  const serious = settings.seriousMode;

  return (
    <div className="mx-auto max-w-xl">
      <span className="sticker -rotate-2 bg-butter">
        <GameIcon className="h-4 w-4" />
        {t("gullibility.title")}
      </span>
      <h1 className="section-title mt-3">{t("gullibility.title")}</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        {t("gullibility.subtitle")}
      </p>
      <div className="clay-card mt-6 p-6 text-center">
        <p className="font-display text-7xl font-black leading-none">
          {gullibilityScore}
        </p>
        <p className="mt-3 font-display text-2xl font-black">
          {serious ? t("settings.officialSkin") : t(BADGE_KEYS[badge])}
        </p>
        <p className="mt-2 text-[10px] font-extrabold uppercase tracking-widest text-muted">
          {t("gullibility.plays", { n: betsPlaced })} · {correctCalls} correct
        </p>
        <p className="mt-4 text-xs leading-relaxed text-muted">
          {t("coins.rules")}
        </p>
      </div>
      <Link href="/daily" className="btn-primary mt-6 w-full">
        {t("home.daily")}
      </Link>
    </div>
  );
}
