"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSettings } from "@/components/providers/settings-provider";
import { useSound } from "@/components/providers/sound-provider";
import { StampCanvas } from "@/components/three/stamp-canvas";
import {
  GuessFirst,
  GuessOutcomeBanner,
  type GuessOutcome,
} from "./guess-first";
import { ShareSheet } from "@/components/share/share-sheet";
import { VerdictLabel, ConfidenceBar, ConfidenceWhy } from "@/components/ui/verdict-label";
import { EvidenceBoard } from "@/components/ui/evidence-board";
import { Disclaimer } from "@/components/ui/disclaimer";
import { SeriousBanner } from "@/components/ui/serious-banner";
import { DemoBadge } from "@/components/ui/demo-badge";
import { getHistoryResult, saveHistory } from "@/lib/local-db";
import type { AnalysisResult } from "@/lib/types";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ShareIcon,
  SearchIcon,
} from "@/components/icons";

export function ResultView({ id }: { id: string }) {
  const { t, settings } = useSettings();
  const { play } = useSound();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [outcome, setOutcome] = useState<GuessOutcome | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const savedHistory = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const cachedRaw = sessionStorage.getItem("iit-last-result");
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw) as AnalysisResult;
        if (cached.id === id) {
          setResult(cached);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Ignore session storage failures.
    }

    try {
      const response = await fetch(`/api/result/${encodeURIComponent(id)}`);
      if (response.ok) {
        const data = (await response.json()) as { result: AnalysisResult };
        setResult(data.result);
        setLoading(false);
        return;
      }
      const local = await getHistoryResult(id);
      if (local) {
        setResult(local);
        setLoading(false);
        return;
      }
      setError(response.status === 404 ? t("errors.notFound") : t("errors.server"));
    } catch {
      const local = await getHistoryResult(id).catch(() => null);
      if (local) {
        setResult(local);
      } else {
        setError(t("errors.server"));
      }
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const serious = Boolean(result?.serious || settings.seriousMode);

  useEffect(() => {
    if (!result) return;
    document.title = `${result.verdict} · Is It True?`;
    if (result.serious || settings.seriousMode) setRevealed(true);
    if (!savedHistory.current) {
      savedHistory.current = true;
      void saveHistory(result, result.language).catch(() => undefined);
    }
  }, [result, settings.seriousMode]);

  function reveal(nextOutcome: GuessOutcome | null) {
    setOutcome(nextOutcome);
    setRevealed(true);
    if (!nextOutcome && !serious) play("whoosh");
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl py-10">
        <div className="h-8 w-36 animate-pulse rounded-full bg-clay" />
        <div className="mt-6 h-28 animate-pulse rounded-3xl bg-clay/70" />
        <div className="mt-4 h-[280px] animate-pulse rounded-[2rem] bg-clay/60" />
        <p className="mt-4 text-center text-sm text-muted">{t("common.loading")}</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <div className="mx-auto flex h-16 w-16 -rotate-6 items-center justify-center rounded-2xl border-2 border-line/20 bg-candy shadow-sticker">
          <SearchIcon className="h-8 w-8" />
        </div>
        <h1 className="mt-5 font-display text-3xl font-black">
          {t("errors.notFound")}
        </h1>
        <p className="mt-2 text-sm text-muted">{error || t("errors.server")}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" className="btn-secondary" onClick={load}>
            {t("common.retry")}
          </button>
          <Link href="/verify" className="btn-primary">
            {t("nav.verify")}
          </Link>
        </div>
      </div>
    );
  }

  if (!revealed && !serious) {
    return (
      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-muted hover:text-ink"
          >
            <ArrowLeftIcon className="h-4 w-4" /> {t("common.back")}
          </Link>
          <span className="chip">
            {t("results.kicker")} #{result.id.slice(-6)}
          </span>
        </div>
        <GuessFirst result={result} onReveal={reveal} />
        <div className="mx-auto mt-4 max-w-3xl">
          <Disclaimer compact />
        </div>
      </div>
    );
  }

  const useSkin = settings.skin === "cap" && !serious;
  const checkedDate = new Date(result.createdAt).toLocaleString(
    settings.language === "en" ? "en-IN" : "en-IN",
    { dateStyle: "medium", timeStyle: "short" },
  );
  const mainClaim = result.claims[0];

  return (
    <div>
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/trending"
            className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-muted hover:text-ink"
          >
            <ArrowLeftIcon className="h-4 w-4" /> {t("nav.trending")}
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip">
              {t("results.kicker")} #{result.id.slice(-6)}
            </span>
            <span className="chip">
              {result.fromCache ? t("results.cached") : t("results.fresh")}
            </span>
            <span className="chip">
              {result.checks} {t("trending.checks")}
            </span>
            {result.demoMode && <DemoBadge compact />}
          </div>
        </div>

        {serious && (
          <div className="mt-4 space-y-2">
            <SeriousBanner topic={result.sensitive} />
            <p className="text-center text-[10px] font-extrabold uppercase tracking-widest text-unverified-deep dark:text-unverified">
              {t("results.seriousLock")}
            </p>
          </div>
        )}

        {outcome && (
          <div className="mt-4">
            <GuessOutcomeBanner outcome={outcome} actual={result.verdict} />
          </div>
        )}

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="clay-card relative mt-4 overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-2.5 ribbon opacity-80" />
          <div className="p-5 pt-7 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-xl">
                <p className="eyebrow">
                  {t("results.checked")} {checkedDate}
                </p>
                <blockquote className="mt-2 font-display text-2xl font-extrabold leading-tight sm:text-3xl">
                  “{mainClaim?.text ?? result.rawInput}”
                </blockquote>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="chip">
                    {result.claims.length} {t("common.claims")}
                  </span>
                  <span className="chip">
                    {t(
                      result.inputType === "text"
                        ? "common.inputText"
                        : result.inputType === "reel"
                          ? "common.inputReel"
                          : "common.inputMedia",
                    )}
                  </span>
                  {result.serious && (
                    <span className="chip border-unverified/40 text-unverified-deep dark:text-unverified">
                      {t("common.serious")}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShareOpen(true)}
                  className="btn-secondary !min-h-10 !px-3 !py-2 !text-[10px]"
                  aria-label={t("common.share")}
                >
                  <ShareIcon className="h-4 w-4" />
                  {t("common.share")}
                </button>
              </div>
            </div>

            <StampCanvas
              verdict={result.verdict}
              useSkin={useSkin}
              serious={serious}
            />

            <div className="grid gap-5 md:grid-cols-[1fr_240px]">
              <div>
                <p className="eyebrow">{t("results.summary")}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {settings.language === "en"
                    ? result.summary
                    : result.summaryHinglish}
                </p>
              </div>
              <div className="rounded-2xl border border-line/15 bg-paper/55 p-4">
                <ConfidenceBar
                  confidence={result.confidence}
                  verdict={result.verdict}
                />
                <p className="mt-2 text-[9px] font-extrabold uppercase tracking-widest text-muted">
                  {t("results.confidenceWhy")}
                </p>
                <ConfidenceWhy text={result.confidenceWhy} />
                <div className="mt-4 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-muted">
                  <span>{t("common.sources")}</span>
                  <span>{result.independentSources ?? result.sources.length}</span>
                </div>
                {result.sourcesDisagree && (
                  <p className="mt-2 text-[10px] font-bold text-misleading-deep dark:text-butter">
                    {t("results.sourcesDisagree")}
                  </p>
                )}
              </div>
            </div>

            {result.demoMode && (
              <p className="mt-4 rounded-xl border border-misleading/30 bg-misleading/10 px-3 py-2 text-[10px] font-semibold leading-relaxed text-misleading-deep dark:text-butter">
                {t("results.demo")}
              </p>
            )}

            {result.warnings.length > 0 && (
              <details className="mt-4 rounded-xl border border-line/15 bg-paper/40 px-3 py-2">
                <summary className="cursor-pointer text-[10px] font-extrabold uppercase tracking-widest text-muted">
                  {t("results.warnings")} ({result.warnings.length})
                </summary>
                <ul className="mt-2 space-y-1 text-[11px] leading-relaxed text-muted">
                  {result.warnings.map((warning) => (
                    <li key={warning}>· {warning}</li>
                  ))}
                </ul>
              </details>
            )}

            {result.transcript && (
              <div className="mt-4 rounded-xl border border-line/15 bg-paper/50 p-3">
                <p className="text-[9px] font-extrabold uppercase tracking-widest text-muted">
                  {t("results.transcript")}
                </p>
                <p className="mt-1 text-xs leading-relaxed">
                  “{result.transcript}”
                </p>
              </div>
            )}
          </div>
        </motion.section>

        <section className="mt-6">
          <div className="flex items-end justify-between gap-3">
            <h2 className="font-display text-2xl font-black">
              {t("results.claims")}
            </h2>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-muted">
              {result.claims.length} {t("common.found")}
            </span>
          </div>
          <div className="mt-3 space-y-3">
            {result.claims.length === 0 && (
              <p className="rounded-2xl border border-dashed border-line/20 p-5 text-sm text-muted">
                {t("errors.invalid")}
              </p>
            )}
            {result.claims.map((claim, index) => (
              <motion.div
                key={claim.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * index }}
              >
                <Link
                  href={`/claim/${result.id}?n=${index}`}
                  className="group flex flex-col gap-3 rounded-2xl border-2 border-line/15 bg-cream p-4 shadow-clay-sm transition-transform hover:-translate-y-0.5 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-3 sm:w-44 sm:shrink-0">
                    <span className="font-display text-xs font-black text-muted">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <VerdictLabel
                      verdict={claim.verdict}
                      useSkin={useSkin}
                      serious={serious}
                      size="sm"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-base font-extrabold leading-snug">
                      {claim.text}
                    </p>
                    <p className="mt-1 line-clamp-1 text-xs text-muted">
                      {settings.language === "en"
                        ? claim.reasoning
                        : claim.reasoningHinglish}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-extrabold tabular-nums text-muted">
                      {claim.confidence}%
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-muted transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <EvidenceBoard sources={result.sources} />
        </section>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="btn-primary"
          >
            <ShareIcon className="h-4 w-4" />
            {t("common.share")}
          </button>
          <Link href="/verify" className="btn-secondary">
            {t("results.again")}
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6">
          <Disclaimer serious={serious} />
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            disabled={feedbackSent}
            onClick={async () => {
              try {
                const response = await fetch("/api/feedback", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    resultId: result.id,
                    verdict: result.verdict,
                  }),
                });
                if (!response.ok) throw new Error("fail");
                setFeedbackSent(true);
              } catch {
                setFeedbackSent(false);
              }
            }}
            className="text-[10px] font-extrabold uppercase tracking-widest text-muted underline decoration-dotted underline-offset-4 hover:text-ink disabled:no-underline"
          >
            {feedbackSent ? t("results.disagreeSent") : t("results.disagree")}
          </button>
        </div>

        {mainClaim && !serious && (
          <Link
            href={`/claim/${result.id}?n=0`}
            className="mt-6 flex items-center justify-between rounded-2xl border-2 border-line/15 bg-clay/50 px-4 py-3 text-sm font-extrabold transition-colors hover:bg-clay"
          >
            {t("results.details")}
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        )}
      </div>

      <ShareSheet
        result={result}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}
