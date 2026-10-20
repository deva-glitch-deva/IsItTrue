"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { useSettings } from "@/components/providers/settings-provider";
import { VerdictLabel, ConfidenceBar } from "@/components/ui/verdict-label";
import { EvidenceBoard } from "@/components/ui/evidence-board";
import { Disclaimer } from "@/components/ui/disclaimer";
import { SeriousBanner } from "@/components/ui/serious-banner";
import { getHistoryResult } from "@/lib/local-db";
import type { AnalysisResult } from "@/lib/types";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  SearchIcon,
} from "@/components/icons";

export function ClaimDetailView({
  id,
  initialIndex,
}: {
  id: string;
  initialIndex: number;
}) {
  const { t, settings } = useSettings();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [index, setIndex] = useState(initialIndex);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const raw = sessionStorage.getItem("iit-last-result");
      if (raw) {
        const cached = JSON.parse(raw) as AnalysisResult;
        if (cached.id === id) {
          setResult(cached);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Ignore storage failures.
    }
    try {
      const response = await fetch(`/api/result/${encodeURIComponent(id)}`);
      if (response.ok) {
        const data = (await response.json()) as { result: AnalysisResult };
        setResult(data.result);
      } else {
        const local = await getHistoryResult(id);
        if (local) setResult(local);
        else setError(t("errors.notFound"));
      }
    } catch {
      const local = await getHistoryResult(id).catch(() => null);
      if (local) setResult(local);
      else setError(t("errors.server"));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!result) return;
    const bounded = Math.min(index, Math.max(0, result.claims.length - 1));
    if (bounded !== index) setIndex(bounded);
    document.title = `${t("claim.title")} · Is It True?`;
  }, [index, result, t]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl py-12">
        <div className="h-8 w-40 animate-pulse rounded-full bg-clay" />
        <div className="mt-6 h-52 animate-pulse rounded-[2rem] bg-clay/60" />
      </div>
    );
  }

  if (error || !result || result.claims.length === 0) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <div className="mx-auto flex h-16 w-16 -rotate-6 items-center justify-center rounded-2xl border-2 border-line/20 bg-butter shadow-sticker">
          <SearchIcon className="h-8 w-8" />
        </div>
        <h1 className="mt-5 font-display text-3xl font-black">
          {t("errors.notFound")}
        </h1>
        <p className="mt-2 text-sm text-muted">{error || t("claim.noSources")}</p>
        <Link href={`/results/${id}`} className="btn-primary mt-6">
          {t("results.kicker")}
        </Link>
      </div>
    );
  }

  const claim = result.claims[index] ?? result.claims[0];
  const serious = result.serious || settings.seriousMode;
  const useSkin = settings.skin === "cap" && !serious;
  const language = settings.language;
  const reasoning =
    language === "en" ? claim.reasoning : claim.reasoningHinglish;
  const reelSays =
    language === "en" ? claim.reelSays : claim.reelSaysHinglish;
  const sourcesSay =
    language === "en" ? claim.sourcesSay : claim.sourcesSayHinglish;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/results/${id}`}
          className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-muted hover:text-ink"
        >
          <ArrowLeftIcon className="h-4 w-4" /> {t("results.kicker")}
        </Link>
        <span className="chip">
          {t("claim.title")} #{result.id.slice(-6)}
        </span>
      </div>

      {serious && (
        <div className="mt-4">
          <SeriousBanner topic={result.sensitive} />
        </div>
      )}

      {result.claims.length > 1 && (
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {result.claims.map((item, chipIndex) => (
            <Link
              key={item.id}
              href={`/claim/${id}?n=${chipIndex}`}
              onClick={() => setIndex(chipIndex)}
              className={clsx(
                "shrink-0 rounded-full border-2 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider transition-colors",
                chipIndex === index
                  ? "border-line bg-ink text-paper"
                  : "border-line/15 bg-paper text-muted",
              )}
            >
              {t("results.claimN")} {chipIndex + 1}
            </Link>
          ))}
        </div>
      )}

      <section className="clay-card relative mt-4 overflow-hidden p-5 sm:p-8">
        <div className="absolute inset-x-0 top-0 h-2.5 ribbon opacity-70" />
        <div className="pt-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="sticker -rotate-2 bg-butter">
              {t("results.claimN")} {index + 1}/{result.claims.length}
            </span>
            <VerdictLabel
              verdict={claim.verdict}
              useSkin={useSkin}
              serious={serious}
              size="lg"
            />
          </div>
          <blockquote className="mt-5 font-display text-3xl font-black leading-[1.05] sm:text-4xl">
            “{claim.text}”
          </blockquote>
          <div className="mt-5 max-w-sm">
            <ConfidenceBar confidence={claim.confidence} verdict={claim.verdict} />
          </div>
        </div>
      </section>

      <section className="mt-6">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-2xl font-black">{t("claim.why")}</h2>
          <div className="h-px flex-1 bg-line/15" />
        </div>
        <p className="mt-3 rounded-2xl border border-line/15 bg-paper/55 p-4 text-sm leading-relaxed text-muted">
          {reasoning}
        </p>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <div
          className={clsx(
            "relative overflow-hidden rounded-[1.6rem] border-2 p-5 shadow-clay-sm",
            serious
              ? "border-line/15 bg-cream"
              : "rotate-[-0.6deg] border-hot/40 bg-hot/10",
          )}
        >
          <span className="sticker -rotate-1 bg-coral bg-[#ff8fa3] text-[#50101c]">
            {t("claim.reel")}
          </span>
          <p className="mt-4 font-display text-xl font-extrabold leading-snug">
            “{reelSays}”
          </p>
          <span className="mt-4 inline-block rounded bg-cream/60 px-2 py-1 text-[9px] font-extrabold uppercase tracking-widest text-muted">
            The claim on trial
          </span>
        </div>
        <div
          className={clsx(
            "relative overflow-hidden rounded-[1.6rem] border-2 p-5 shadow-clay-sm paper-sheet",
            serious
              ? "border-line/15 bg-cream"
              : "rotate-[0.6deg] border-true/40 bg-true/10",
          )}
        >
          <span className="sticker rotate-1 bg-mint/60 text-[#0a3d27]">
            {t("claim.sources")}
          </span>
          <p className="mt-4 text-sm font-semibold leading-relaxed">
            {sourcesSay}
          </p>
          <span className="mt-4 inline-block rounded bg-cream/60 px-2 py-1 text-[9px] font-extrabold uppercase tracking-widest text-muted">
            {claim.sources.length} {t("claim.sourceCount")}
          </span>
        </div>
      </section>

      <section className="mt-8">
        <EvidenceBoard sources={claim.sources} />
      </section>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link href="/verify" className="btn-primary">
          {t("results.again")}
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
        <Link href={`/results/${id}`} className="btn-secondary">
          {t("common.back")}
        </Link>
      </div>

      <div className="mt-4">
        <Disclaimer serious={serious} />
      </div>
    </div>
  );
}
