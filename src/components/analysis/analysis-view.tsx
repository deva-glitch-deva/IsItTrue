"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useSettings } from "@/components/providers/settings-provider";
import { useCoins } from "@/components/providers/coins-provider";
import { useSound, vibrate } from "@/components/providers/sound-provider";
import { useToast } from "@/components/providers/toast-provider";
import { GaugeCanvas } from "@/components/three/gauge-canvas";
import { Scanner } from "@/components/analysis/scanner";
import { Disclaimer } from "@/components/ui/disclaimer";
import {
  RefreshIcon,
  SearchIcon,
} from "@/components/icons";
import {
  clearPendingCheck,
  getPendingCheck,
  type PendingCheck,
} from "@/lib/pending-check";
import { saveHistory } from "@/lib/local-db";
import {
  CACHED_CHECK_REWARD,
  FRESH_CHECK_REWARD,
} from "@/lib/constants";
import { emitCoinBurst } from "@/components/ui/coin-shower";
import type { AnalysisResult, Verdict } from "@/lib/types";

type Stage = {
  key:
    | "analysis.stage.transcribe"
    | "analysis.stage.extract"
    | "analysis.stage.search"
    | "analysis.stage.compare"
    | "analysis.stage.stamp";
  active: boolean;
};

export function AnalysisView() {
  const router = useRouter();
  const { t, settings, hydrated } = useSettings();
  const { earn } = useCoins();
  const { play } = useSound();
  const { toast } = useToast();
  const [pending, setPending] = useState<PendingCheck | null>(null);
  const [ready, setReady] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [settled, setSettled] = useState(false);
  const [verdict, setVerdict] = useState<Verdict>("UNVERIFIED");
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState<number | null>(null);
  const started = useRef(false);
  const timer = useRef<number | null>(null);

  const stages: Stage[] = [
    { key: "analysis.stage.transcribe", active: pending?.mode === "media" },
    { key: "analysis.stage.extract", active: true },
    { key: "analysis.stage.search", active: true },
    { key: "analysis.stage.compare", active: true },
  ].filter((stage) => stage.active) as Stage[];

  const runCheck = useCallback(
    async (input: PendingCheck) => {
      setError("");
      setErrorCode(null);
      setStageIndex(0);
      setSettled(false);

      const requestedAt = Date.now();
      let response: Response;
      try {
        if (input.mode === "media" && input.file) {
          const form = new FormData();
          form.append("mode", "media");
          form.append("language", input.language);
          form.append("file", input.file, input.file.name);
          response = await fetch("/api/verify", {
            method: "POST",
            body: form,
          });
        } else {
          response = await fetch("/api/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mode: input.mode,
              language: input.language,
              claim: input.mode === "text" ? input.claim : undefined,
              reelUrl: input.mode === "reel" ? input.reelUrl : undefined,
              caption: input.mode === "reel" ? input.caption : undefined,
            }),
          });
        }
      } catch {
        setError(t("analysis.error"));
        return;
      }

      if (!response.ok) {
        setErrorCode(response.status);
        if (response.status === 429) {
          setError(t("errors.rate"));
        } else {
          const body = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          setError(body?.error || t("analysis.error"));
        }
        return;
      }

      const data = (await response.json()) as {
        result: AnalysisResult;
        cacheMiss: boolean;
      };
      if (!data.result?.id) {
        setError(t("analysis.error"));
        return;
      }

      try {
        sessionStorage.setItem("iit-last-result", JSON.stringify(data.result));
      } catch {
        // The result can still be loaded by id from the server cache.
      }
      await saveHistory(data.result, input.language).catch(() => undefined);

      const effectiveSerious = data.result.serious || settings.seriousMode;
      if (!effectiveSerious) {
        const rewardedKey = `iit-rewarded:${data.result.id}`;
        let alreadyRewarded = false;
        try {
          alreadyRewarded = Boolean(localStorage.getItem(rewardedKey));
        } catch {
          // Ignore storage failures.
        }
        if (!alreadyRewarded) {
          const reward = data.cacheMiss
            ? FRESH_CHECK_REWARD
            : CACHED_CHECK_REWARD;
          const { awarded, capped } = earn(reward);
          try {
            localStorage.setItem(rewardedKey, "1");
          } catch {
            // Ignore storage failures.
          }
          if (capped) {
            toast(t("coins.cap"));
          } else if (awarded > 0) {
            toast(
              t(data.cacheMiss ? "coins.earned" : "coins.cachedEarned", {
                n: awarded,
              }),
              "success",
            );
            play("coin");
            emitCoinBurst(awarded);
          }
        }
      }

      setStageIndex(stages.length);
      setVerdict(data.result.verdict);
      setSettled(true);
      play("whoosh");
      vibrate([20, 40, 20]);

      const elapsed = Date.now() - requestedAt;
      const minimum = 2200;
      window.setTimeout(() => {
        clearPendingCheck();
        router.replace(`/results/${data.result.id}`);
      }, Math.max(900, minimum - elapsed));
    },
    [earn, play, router, settings.seriousMode, stages.length, t, toast],
  );

  useEffect(() => {
    if (!hydrated) return;
    const input = getPendingCheck();
    if (!input) {
      setReady(true);
      return;
    }
    setPending(input);
    setReady(true);
    if (started.current) return;
    started.current = true;
    void runCheck(input);
  }, [hydrated, runCheck]);

  useEffect(() => {
    if (!ready || error || settled || !pending) return;
    timer.current = window.setInterval(() => {
      setStageIndex((current) =>
        Math.min(current + 1, Math.max(0, stages.length - 2)),
      );
    }, 1150);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [ready, error, settled, pending, stages.length]);

  if (!ready) {
    return (
      <div className="mx-auto mt-20 max-w-lg text-center">
        <div className="mx-auto h-20 w-20 animate-pulse rounded-full bg-clay" />
        <p className="mt-4 text-sm text-muted">{t("common.loading")}</p>
      </div>
    );
  }

  if (!pending) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <div className="mx-auto flex h-16 w-16 -rotate-6 items-center justify-center rounded-2xl border-2 border-line/20 bg-butter shadow-sticker">
          <SearchIcon className="h-8 w-8" />
        </div>
        <h1 className="mt-5 font-display text-3xl font-black">
          {t("analysis.error")}
        </h1>
        <p className="mt-2 text-sm text-muted">{t("analysis.errorHint")}</p>
        <Link href="/verify" className="btn-primary mt-6">
          {t("nav.verify")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow">{t("analysis.title")}</p>
          <h1 className="mt-2 break-words font-display text-2xl font-black leading-tight sm:text-5xl sm:leading-none">
            {error ? t("analysis.error") : t("analysis.wait")}
          </h1>
        </div>
        <span className="chip rotate-1">
          Case #{String(pending.createdAt).slice(-5)}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="clay-card mt-6 p-6 sm:p-8"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-false/40 bg-false/10 text-3xl font-black text-false">
              !
            </div>
            <p className="mx-auto mt-4 max-w-md text-center text-sm leading-relaxed text-muted">
              {error}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  if (pending) void runCheck(pending);
                }}
              >
                <RefreshIcon className="h-4 w-4" />
                {t("common.retry")}
              </button>
              <Link href="/verify" className="btn-secondary">
                {t("nav.verify")}
              </Link>
            </div>
            {errorCode && (
              <p className="mt-4 text-center text-[10px] uppercase tracking-widest text-muted">
                Error {errorCode}
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 grid gap-4 overflow-hidden lg:grid-cols-[1.35fr_0.65fr] lg:gap-5"
          >
            <div className="clay-card overflow-hidden p-3 sm:p-4">
              <Scanner
                claim={
                  pending.claim ||
                  pending.caption ||
                  pending.reelUrl ||
                  pending.file?.name ||
                  ""
                }
                stageIndex={stageIndex}
                settled={settled}
                verdict={verdict}
                reducedMotion={settings.reducedMotion}
                steps={[
                  ...stages.map((stage) => t(stage.key)),
                  t("analysis.stage.stamp"),
                ]}
                currentLabel={
                  settled
                    ? t("analysis.stage.stamp")
                    : t(stages[Math.min(stageIndex, stages.length - 1)]?.key)
                }
              />
            </div>

            <div className="clay-card relative overflow-hidden p-4">
              <div className="absolute inset-x-0 top-0 h-2 ribbon opacity-70" />
              <div className="mx-auto h-[180px] w-full sm:h-[220px]">
                <GaugeCanvas settled={settled} verdict={verdict} />
              </div>
              <div className="mt-1 flex items-center justify-center gap-2">
                <span
                  className={
                    settled
                      ? "h-2 w-2 rounded-full bg-true"
                      : "h-2 w-2 animate-blink rounded-full bg-false"
                  }
                />
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted">
                  {settled ? "Needle settled" : "Needle detecting nonsense"}
                </p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-line/10 bg-paper/60 px-3 py-2">
                  <p className="text-[8px] font-extrabold uppercase tracking-widest text-muted">
                    Input
                  </p>
                  <p className="mt-0.5 truncate text-xs font-bold">
                    {pending.mode === "text"
                      ? "Text claim"
                      : pending.mode === "reel"
                        ? "Instagram Reel"
                        : pending.file?.name || "Media file"}
                  </p>
                </div>
                <div className="rounded-xl border border-line/10 bg-paper/60 px-3 py-2">
                  <p className="text-[8px] font-extrabold uppercase tracking-widest text-muted">
                    Language
                  </p>
                  <p className="mt-0.5 text-xs font-bold">
                    {pending.language === "en" ? "English" : "Hinglish"}
                  </p>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-dashed border-line/20 p-3 text-xs leading-relaxed text-muted">
                {pending.mode === "reel"
                  ? "Reels are not always fetchable. Your caption is treated as the primary evidence."
                  : pending.mode === "media"
                    ? "Media is processed in memory and never stored."
                    : "We cache the claim text, not you."}
              </div>
              <div className="mt-4">
                <Disclaimer compact />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
