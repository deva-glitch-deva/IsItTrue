"use client";

import Link from "next/link";
import { CoinIcon } from "@/components/icons";
import { useCoins } from "@/components/providers/coins-provider";
import { useSettings } from "@/components/providers/settings-provider";

export function CoinPill({ linked = false }: { linked?: boolean }) {
  const { balance, hydrated } = useCoins();
  const { settings, t } = useSettings();
  if (settings.seriousMode) return null;
  const content = (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-butter/40 bg-butter/15 px-3 py-1.5 text-xs font-extrabold text-ink">
      <CoinIcon className="h-4 w-4 text-misleading" />
      <span>{hydrated ? balance : "—"}</span>
      <span className="hidden text-[9px] font-bold uppercase tracking-wider text-muted sm:inline">
        {t("common.playCoins")}
      </span>
    </span>
  );
  if (linked) {
    return (
      <Link href="/gullibility" aria-label={t("gullibility.title")}>
        {content}
      </Link>
    );
  }
  return content;
}
