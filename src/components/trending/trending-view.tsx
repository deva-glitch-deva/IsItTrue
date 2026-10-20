"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSettings } from "@/components/providers/settings-provider";
import { VerdictLabel } from "@/components/ui/verdict-label";
import { EmptyState } from "@/components/ui/empty-state";
import { SeriousBanner } from "@/components/ui/serious-banner";
import { FlameIcon, ArrowRightIcon, SearchIcon } from "@/components/icons";
import { formatRelativeTime } from "@/lib/text";
import type { TrendingItem } from "@/lib/types";

export function TrendingView() {
  const { t, settings } = useSettings();
  const [items, setItems] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    fetch(`/api/trending?lang=${settings.language}&limit=16`)
      .then((response) => {
        if (!response.ok) throw new Error("Trending failed");
        return response.json() as Promise<{ items: TrendingItem[] }>;
      })
      .then((data) => {
        if (active) setItems(data.items ?? []);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [settings.language]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="sticker -rotate-2 bg-hot/15 text-hot">
            <FlameIcon className="h-4 w-4" />
            24h board
          </span>
          <h1 className="section-title mt-3">{t("trending.title")}</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
            {t("trending.subtitle")}
          </p>
        </div>
        <div className="max-w-xs rotate-1 rounded-xl border border-line/15 bg-clay/60 px-4 py-3 text-[10px] leading-relaxed text-muted">
          {t("trending.filtered")}
        </div>
      </div>

      {settings.seriousMode && (
        <div className="mt-5">
          <SeriousBanner />
        </div>
      )}

      {loading ? (
        <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="mb-4 h-48 animate-pulse break-inside-avoid rounded-[1.6rem] bg-clay/60"
              style={{ height: `${170 + (index % 3) * 34}px` }}
            />
          ))}
        </div>
      ) : error ? (
        <div className="mt-8">
          <EmptyState
            title={t("errors.server")}
            body={t("common.retry")}
            action={t("common.retry")}
            href="/trending"
          />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title={t("trending.empty")}
            action={t("home.cta")}
            href="/verify"
          />
        </div>
      ) : (
        <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {items.map((item, index) => {
            const serious = item.sensitive || settings.seriousMode;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(0.4, index * 0.05) }}
                className="mb-4 break-inside-avoid"
                style={{
                  transform: `rotate(${index % 3 === 0 ? -0.7 : index % 3 === 1 ? 0.5 : -0.2}deg)`,
                }}
              >
                <div className="clay-card relative overflow-hidden p-4">
                  {serious && (
                    <div className="absolute right-0 top-0 rounded-bl-xl bg-unverified/15 px-2 py-1 text-[8px] font-extrabold uppercase tracking-widest text-unverified-deep dark:text-unverified">
                      Serious
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2 pr-16">
                    <span className="font-display text-xs font-black text-muted">
                      #{String(index + 1).padStart(2, "0")}
                    </span>
                    <VerdictLabel
                      verdict={item.verdict}
                      useSkin={!serious && settings.skin === "cap"}
                      serious={serious}
                      size="sm"
                    />
                  </div>
                  <Link
                    href={`/results/${item.id}`}
                    className="group mt-4 block"
                  >
                    <p className="font-display text-lg font-extrabold leading-snug transition-colors group-hover:text-hot">
                      {item.claim}
                    </p>
                  </Link>
                  <div className="mt-4 flex items-center justify-between border-t border-line/10 pt-3">
                    <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-muted">
                      <FlameIcon className="h-3.5 w-3.5 text-hot" />
                      {item.checks} {t("trending.checks")}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted/80">
                      {formatRelativeTime(item.lastCheckedAt, settings.language)}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Link
                      href={`/results/${item.id}`}
                      className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-ink px-2 py-2 text-[9px] font-extrabold uppercase tracking-wider text-paper"
                    >
                      {t("common.view")} <ArrowRightIcon className="h-3 w-3" />
                    </Link>
                    <Link
                      href={`/verify?claim=${encodeURIComponent(item.claim)}`}
                      className="inline-flex items-center justify-center gap-1 rounded-lg border border-line/20 px-2 py-2 text-[9px] font-extrabold uppercase tracking-wider text-muted hover:text-ink"
                      aria-label={t("trending.checkIt")}
                    >
                      <SearchIcon className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
