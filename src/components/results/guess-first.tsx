"use client";

import { useState } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useSettings } from "@/components/providers/settings-provider";
import { useCoins } from "@/components/providers/coins-provider";
import { useSound, vibrate } from "@/components/providers/sound-provider";
import { CoinIcon, GameIcon } from "@/components/icons";
import { VERDICT_META } from "@/lib/constants";
import { betOptions, MIN_BET, winPayout } from "@/lib/coins";
import { emitCoinBurst } from "@/components/ui/coin-shower";
import type { AnalysisResult, Verdict } from "@/lib/types";

export interface GuessOutcome {
  correct: boolean;
  bet: number;
  payout: number;
  choice: Verdict;
  gullibilityScore: number;
}

const OPTIONS: Array<{ value: Verdict; key: "guess.true" | "guess.false" | "guess.sus" }> = [
  { value: "TRUE", key: "guess.true" },
  { value: "FALSE", key: "guess.false" },
  { value: "MISLEADING", key: "guess.sus" },
];

export function isGuessCorrect(choice: Verdict, actual: Verdict): boolean {
  if (choice === "MISLEADING") {
    return actual === "MISLEADING" || actual === "UNVERIFIED";
  }
  return choice === actual;
}

export function GuessFirst({
  result,
  onReveal,
}: {
  result: AnalysisResult;
  onReveal: (outcome: GuessOutcome | null) => void;
}) {
  const { t } = useSettings();
  const { balance, spendBet, payout, recordGuess } = useCoins();
  const { play } = useSound();
  const [choice, setChoice] = useState<Verdict | null>(null);
  const options = betOptions(balance);
  const [bet, setBet] = useState(options[0] ?? MIN_BET);
  const [error, setError] = useState("");
  const [locking, setLocking] = useState(false);
  const claim = result.claims[0]?.text ?? result.rawInput;

  function lockGuess() {
    if (!choice || locking) return;
    setLocking(true);
    if (bet < MIN_BET) {
      setError(t("guess.minBet"));
      setLocking(false);
      return;
    }
    const max = Math.floor(balance * 0.5);
    if (bet > max) {
      setError(t("guess.maxBet"));
      setLocking(false);
      return;
    }
    if (!spendBet(bet)) {
      setError(t("guess.noCoins"));
      setLocking(false);
      return;
    }
    const correct = isGuessCorrect(choice, result.verdict);
    const heroPayout = correct ? winPayout(bet) : 0;
    if (heroPayout > 0) {
      payout(heroPayout);
      emitCoinBurst(heroPayout);
    }
    const { gullibilityScore } = recordGuess(correct);
    play(correct ? "coin" : "buzz");
    vibrate(correct ? [30, 30, 30] : [80, 50, 80]);
    onReveal({
      correct,
      bet,
      payout: heroPayout,
      choice,
      gullibilityScore,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl"
    >
      <div className="clay-card relative overflow-hidden p-5 sm:p-8">
        <div className="absolute inset-x-0 top-0 h-2.5 ribbon" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="sticker -rotate-2 bg-butter">
            <GameIcon className="h-4 w-4" />
            {t("guess.title")}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line/15 bg-paper px-3 py-1.5 text-xs font-extrabold">
            <CoinIcon className="h-4 w-4 text-misleading" />
            {t("guess.balance")}: {balance}
          </span>
        </div>

        <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted">
          {t("guess.subtitle")}
        </p>

        <div className="relative mt-5 rounded-2xl border-2 border-line/20 bg-paper/70 p-5 paper-sheet">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-muted">
            {t("results.kicker")} · {t("common.claim")}
          </p>
          <blockquote className="mt-2 font-display text-2xl font-extrabold leading-tight sm:text-3xl">
            “{claim}”
          </blockquote>
          <div className="mt-3 h-3 w-24 -rotate-2 rounded bg-misleading/50" />
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          {OPTIONS.map((option) => {
            const active = choice === option.value;
            const meta = VERDICT_META[option.value];
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setChoice(option.value);
                  setError("");
                  play("tick");
                }}
                className={clsx(
                  "relative min-h-16 rounded-2xl border-2 px-4 py-3 text-left transition-transform",
                  active
                    ? "-translate-y-1 shadow-clay-sm"
                    : "border-line/20 bg-paper hover:-translate-y-0.5",
                )}
                style={
                  active
                    ? {
                        background: meta.bg,
                        color: meta.text,
                        borderColor: meta.color,
                      }
                    : undefined
                }
              >
                <span className="font-display text-xl font-black uppercase">
                  {t(option.key)}
                </span>
                <span className="mt-1 block text-[9px] font-extrabold uppercase tracking-widest opacity-60">
                  {option.value === "TRUE"
                    ? "Official: True"
                    : option.value === "FALSE"
                      ? "Official: False"
                      : "Misleading / Unverified"}
                </span>
                {active && (
                  <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-current" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="label">{t("guess.bet")}</p>
            <div className="flex gap-2">
              {(options.length ? options : [MIN_BET]).map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setBet(amount)}
                  disabled={balance < amount}
                  aria-pressed={bet === amount}
                  className={clsx(
                    "rounded-full border-2 px-3 py-1.5 text-xs font-extrabold tabular-nums transition-colors disabled:opacity-35",
                    bet === amount
                      ? "border-line bg-ink text-paper"
                      : "border-line/20 bg-paper text-muted",
                  )}
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-line/15 bg-paper px-4 py-2 text-right">
            <p className="text-[8px] font-extrabold uppercase tracking-widest text-muted">
              {t("guess.pot")}
            </p>
            <p className="font-display text-2xl font-black text-misleading-deep dark:text-misleading">
              {bet * 2}
            </p>
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-3 text-xs font-bold text-false">
            {error}
          </p>
        )}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={lockGuess}
            disabled={!choice || locking}
            className="btn-primary flex-1"
          >
            {t("guess.lock")}
          </button>
          <button
            type="button"
            onClick={() => onReveal(null)}
            className="text-center text-[10px] font-extrabold uppercase tracking-widest text-muted underline decoration-dotted underline-offset-4 hover:text-ink"
          >
            {t("common.reveal")}
          </button>
        </div>
        <p className="mt-3 text-center text-[9px] font-semibold uppercase tracking-wider text-muted">
          {t("coins.rules")}
        </p>
      </div>
    </motion.div>
  );
}

export function GuessOutcomeBanner({
  outcome,
  actual,
}: {
  outcome: GuessOutcome;
  actual: Verdict;
}) {
  const { t } = useSettings();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className={clsx(
        "relative overflow-hidden rounded-2xl border-2 px-5 py-4 shadow-clay-sm",
        outcome.correct
          ? "border-true/50 bg-true/10"
          : "border-false/40 bg-false/10",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-2xl font-black">
            {outcome.correct ? t("guess.called") : t("guess.duped")}
          </p>
          <p className="mt-1 text-xs font-semibold text-muted">
            {t("guess.result", {
              bet: outcome.bet,
              payout: outcome.payout,
              score: outcome.gullibilityScore,
            })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[8px] font-extrabold uppercase tracking-widest text-muted">
            {t("daily.actual")}
          </p>
          <p className="font-display text-lg font-black">
            {VERDICT_META[actual].official}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
