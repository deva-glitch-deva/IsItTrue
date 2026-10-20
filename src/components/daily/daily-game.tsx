"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useSettings } from "@/components/providers/settings-provider";
import { useCoins } from "@/components/providers/coins-provider";
import { useSound, vibrate } from "@/components/providers/sound-provider";
import { useToast } from "@/components/providers/toast-provider";
import { VerdictLabel } from "@/components/ui/verdict-label";
import { SeriousBanner } from "@/components/ui/serious-banner";
import { isGuessCorrect } from "@/components/results/guess-first";
import { getDailyClaims } from "@/lib/daily-claims";
import {
  getDailyPlayed,
  getDailyStreakMeta,
  setDailyPlayed,
} from "@/lib/local-db";
import { DAILY_COMPLETION_REWARD, DAILY_CORRECT_REWARD } from "@/lib/constants";
import { dailyStreakBonus } from "@/lib/coins";
import {
  ArrowRightIcon,
  ClockIcon,
  CoinIcon,
  ExternalIcon,
  GameIcon,
  LinkIcon,
  ShareIcon,
} from "@/components/icons";
import {
  generateDailyScoreCard,
  shareCard,
} from "@/lib/share-card";
import { emitCoinBurst } from "@/components/ui/coin-shower";
import type { DailyClaim, Verdict } from "@/lib/types";

const CALLS: Array<{
  value: Verdict;
  labelKey: "daily.noCap" | "daily.cap" | "daily.sus";
  color: string;
  border: string;
  swipe: string;
}> = [
  {
    value: "TRUE",
    labelKey: "daily.noCap",
    color: "bg-true/15 text-true-deep dark:text-mint",
    border: "border-true",
    swipe: "right",
  },
  {
    value: "FALSE",
    labelKey: "daily.cap",
    color: "bg-false/15 text-false-deep dark:text-candy",
    border: "border-false",
    swipe: "left",
  },
  {
    value: "MISLEADING",
    labelKey: "daily.sus",
    color: "bg-misleading/20 text-misleading-deep dark:text-butter",
    border: "border-misleading",
    swipe: "up",
  },
];

export function DailyGame() {
  const params = useSearchParams();
  const { t, settings } = useSettings();
  const { earn, recordGuess } = useCoins();
  const { play } = useSound();
  const { toast } = useToast();
  const { dayKey, claims } = useMemo(() => getDailyClaims(), []);
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<Verdict | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);
  const [playedBefore, setPlayedBefore] = useState<number | null>(null);
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [challengeCopied, setChallengeCopied] = useState(false);
  const [cardBusy, setCardBusy] = useState(false);
  const rewarded = useRef(false);
  const sharedScore = params.get("score");
  const sharedTotal = params.get("total");
  const shareNumber = sharedScore ? Number.parseInt(sharedScore, 10) : null;

  useEffect(() => {
    const previous = getDailyPlayed(dayKey);
    setPlayedBefore(previous?.score ?? null);
    rewarded.current = Boolean(previous);
  }, [dayKey]);

  const current = claims[index];
  const serious = settings.seriousMode;
  const scoreToUse = finished ? score : sharedScore ? shareNumber : null;
  const challengeUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/daily?score=${scoreToUse ?? 0}&total=5`;
  }, [scoreToUse]);

  function choose(value: Verdict) {
    if (!current || revealed) return;
    setChoice(value);
    setRevealed(true);
    const correct = isGuessCorrect(value, current.verdict);
    setAnswers((currentAnswers) => [...currentAnswers, correct]);
    if (correct) {
      setScore((currentScore) => currentScore + 1);
      if (!rewarded.current) {
        const { awarded, capped } = earn(DAILY_CORRECT_REWARD);
        if (capped) toast(t("coins.cap"));
        else if (awarded > 0) {
          play("coin");
          emitCoinBurst(awarded);
        }
      } else {
        play("coin");
      }
      vibrate(24);
    } else {
      play("buzz");
      vibrate(60);
    }
    if (!rewarded.current) recordGuess(correct);
  }

  function next() {
    if (!revealed) return;
    if (index >= claims.length - 1) {
      setFinished(true);
      const finalScore = score;
      const previous = getDailyStreakMeta();
      if (previous?.dayKey && previous.dayKey > dayKey) {
        toast(t("daily.clockWarn"));
        return;
      }
      if (!rewarded.current) {
        rewarded.current = true;
        setDailyPlayed(dayKey, finalScore, answers);
        const streak = getDailyStreakMeta()?.streak ?? 1;
        const bonus = dailyStreakBonus(streak);
        const { awarded } = earn(DAILY_COMPLETION_REWARD + bonus);
        if (awarded > 0) {
          play("coin");
          emitCoinBurst(awarded);
          toast(
            bonus > 0
              ? `${t("coins.earned", { n: awarded })} · ${t("daily.streak", { n: bonus })}`
              : t("coins.earned", { n: awarded }),
            "success",
          );
        }
      }
      return;
    }
    setIndex((currentIndex) => currentIndex + 1);
    setChoice(null);
    setRevealed(false);
    setDragX(0);
    setDragY(0);
  }

  async function shareScoreCard() {
    setCardBusy(true);
    try {
      const blob = await generateDailyScoreCard({
        score: scoreToUse ?? score,
        total: 5,
        dayKey,
        siteUrl:
          typeof window !== "undefined" ? window.location.origin : "",
        results: answers.length === 5 ? answers : undefined,
      });
      const text = `${t("daily.challengeText", { score: scoreToUse ?? score })} ${challengeUrl}`;
      const outcome = await shareCard(blob, text);
      toast(
        outcome === "downloaded" ? t("share.downloaded") : t("common.done"),
        "success",
      );
    } catch {
      toast(t("share.failed"), "error");
    } finally {
      setCardBusy(false);
    }
  }

  async function copyChallenge() {
    if (typeof navigator === "undefined") return;
    const text = `${t("daily.challengeText", { score: scoreToUse ?? 0 })} ${challengeUrl}`;
    try {
      await navigator.clipboard.writeText(text);
      setChallengeCopied(true);
      toast(t("daily.copied"), "success");
    } catch {
      toast(t("share.failed"), "error");
    }
  }

  if (serious) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-3">
          <span className="sticker -rotate-2 bg-misleading/30">
            <GameIcon className="h-4 w-4" />
            {t("daily.title")}
          </span>
        </div>
        <h1 className="section-title mt-4">{t("daily.title")}</h1>
        <div className="mt-5">
          <SeriousBanner />
        </div>
        <div className="clay-card mt-5 p-6 text-center">
          <ClockIcon className="mx-auto h-10 w-10 text-muted" />
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {t("daily.serious")}
          </p>
          <Link href="/settings" className="btn-primary mt-5">
            {t("nav.settings")}
          </Link>
        </div>
      </div>
    );
  }

  if (finished) {
    const finalScore = score;
    return (
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="clay-card relative overflow-hidden p-6 text-center sm:p-10"
        >
          <div className="absolute inset-x-0 top-0 h-3 ribbon" />
          <span className="sticker rotate-2 bg-butter">
            {t("daily.done")}
          </span>
          <h1 className="mt-5 font-display text-5xl font-black leading-none">
            {t("daily.score", { score: finalScore })}
          </h1>
          <p className="mt-3 text-sm text-muted">
            {finalScore >= 4
              ? "Sharp eye. The group chat is safe with you."
              : finalScore >= 2
                ? "Solid instincts. A little more evidence next time."
                : "The feed got you this time. The receipts are undefeated."}
          </p>
          <div className="mx-auto mt-6 grid max-w-sm grid-cols-5 gap-2">
            {claims.map((claim, claimIndex) => {
              const result = answers[claimIndex] ?? false;
              return (
                <div
                  key={claim.id}
                  className={clsx(
                    "flex h-10 items-center justify-center rounded-lg border-2 font-display text-sm font-black",
                    result
                      ? "border-true/40 bg-true/15 text-true-deep dark:text-mint"
                      : "border-line/10 bg-paper text-muted",
                  )}
                >
                  {result ? "Y" : "N"}
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={shareScoreCard}
              disabled={cardBusy}
              className="btn-primary"
            >
              <ShareIcon className="h-4 w-4" />
              {cardBusy ? t("share.generating") : t("daily.shareCard")}
            </button>
            <button
              type="button"
              onClick={copyChallenge}
              className="btn-secondary"
            >
              <LinkIcon className="h-4 w-4" />
              {challengeCopied ? t("common.copied") : t("daily.challenge")}
            </button>
            <Link href="/trending" className="btn-secondary">
              {t("nav.trending")}
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-4 break-all rounded-lg border border-line/10 bg-paper/55 px-3 py-2 text-[9px] text-muted">
            {challengeUrl}
          </p>
          <p className="mt-4 text-[9px] font-extrabold uppercase tracking-widest text-muted">
            {t("daily.tomorrow")}
          </p>
        </motion.div>

        <div className="mt-5 space-y-2">
          {claims.map((claim, claimIndex) => (
            <div
              key={claim.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-line/10 bg-cream/60 px-3 py-2.5"
            >
              <div className="flex items-center gap-2">
                <span className="font-display text-[10px] font-black text-muted">
                  {claimIndex + 1}
                </span>
                <VerdictLabel verdict={claim.verdict} useSkin serious={false} size="sm" />
                <p className="line-clamp-1 text-xs font-semibold text-muted">
                  {claim.claim}
                </p>
              </div>
              <a
                href={claim.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-muted hover:text-ink"
                aria-label={t("daily.viewClaim")}
              >
                <ExternalIcon className="h-3.5 w-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="sticker -rotate-2 bg-butter">
            <GameIcon className="h-4 w-4" />
            Daily
          </span>
          <h1 className="section-title mt-3">{t("daily.title")}</h1>
          <p className="mt-2 max-w-md text-sm text-muted">{t("daily.subtitle")}</p>
        </div>
        <div className="rounded-xl border border-line/15 bg-paper px-3 py-2 text-right">
          <p className="text-[8px] font-extrabold uppercase tracking-widest text-muted">
            {t("daily.card", { n: index + 1 })}
          </p>
          <p className="font-display text-2xl font-black">
            {score}
            <span className="text-sm text-muted">/5</span>
          </p>
        </div>
      </div>

      {shareNumber !== null && !finished && !playedBefore && (
        <div className="mt-4 rounded-2xl border-2 border-sky/50 bg-sky/10 px-4 py-3 text-sm font-bold">
          {t("daily.sharedScore", { score: shareNumber })}
          {sharedTotal ? ` / ${sharedTotal}` : ""} — {t("daily.challenge")}
        </div>
      )}

      {playedBefore !== null && !rewarded.current && (
        <p className="mt-3 text-[10px] font-extrabold uppercase tracking-widest text-muted">
          {t("daily.done")}: {t("daily.score", { score: playedBefore })}
        </p>
      )}

      <div className="relative mt-5 select-none">
        <div className="absolute inset-x-5 top-4 h-full rotate-2 rounded-[2rem] border-2 border-line/10 bg-clay/60" />
        <div className="absolute inset-x-2.5 top-2 h-full -rotate-1 rounded-[2rem] border-2 border-line/10 bg-clay/80" />
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 20, rotate: -1 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: dragX > 0 ? 300 : -300, rotate: 8 }}
            transition={{ duration: 0.22 }}
            drag={!revealed}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.7}
            onDrag={(_, info) => {
              setDragX(info.offset.x);
              setDragY(info.offset.y);
            }}
            onDragEnd={(_, info) => {
              if (info.offset.x > 110) choose("TRUE");
              else if (info.offset.x < -110) choose("FALSE");
              else if (info.offset.y < -110) choose("MISLEADING");
              setDragX(0);
              setDragY(0);
            }}
            className="clay-card relative cursor-grab overflow-hidden p-5 active:cursor-grabbing sm:p-7"
            style={{
              rotate: dragX / 40,
              x: dragX,
              y: dragY,
            }}
          >
            <div className="absolute inset-x-0 top-0 h-2 ribbon opacity-70" />
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-muted">
                {t("daily.card", { n: index + 1 })} · {dayKey}
              </span>
              <span className="chip">
                <CoinIcon className="h-3 w-3 text-misleading" /> +{DAILY_CORRECT_REWARD}
              </span>
            </div>

            <div className="relative mt-6 flex min-h-[240px] flex-col justify-center rounded-[1.5rem] border-2 border-line/15 bg-paper/55 p-5 paper-sheet sm:min-h-[280px]">
              {dragX < -60 && (
                <span className="absolute right-4 top-4 rotate-6 rounded-lg border-2 border-false bg-false/15 px-3 py-1 font-display text-xl font-black uppercase text-false">
                  Cap
                </span>
              )}
              {dragX > 60 && (
                <span className="absolute left-4 top-4 -rotate-6 rounded-lg border-2 border-true bg-true/15 px-3 py-1 font-display text-xl font-black uppercase text-true">
                  No Cap
                </span>
              )}
              {dragY < -60 && (
                <span className="absolute left-1/2 top-4 -translate-x-1/2 rounded-lg border-2 border-misleading bg-misleading/15 px-3 py-1 font-display text-xl font-black uppercase text-misleading-deep">
                  Sus
                </span>
              )}
              <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-muted">
                {t("daily.swipe")}
              </p>
              <p className="mt-3 font-display text-3xl font-black leading-[1.05] sm:text-4xl">
                “{current.claim}”
              </p>
              <span className="mt-5 h-4 w-28 -rotate-2 rounded bg-misleading/50" />
            </div>

            {!revealed ? (
              <div className="mt-5 grid grid-cols-3 gap-2">
                {CALLS.map((call) => (
                  <button
                    key={call.value}
                    type="button"
                    onClick={() => choose(call.value)}
                    className={clsx(
                      "min-h-12 rounded-xl border-2 px-2 py-2 font-display text-sm font-black uppercase transition-transform hover:-translate-y-0.5",
                      call.color,
                      call.border,
                    )}
                  >
                    {t(call.labelKey)}
                  </button>
                ))}
              </div>
            ) : (
              <DailyReveal
                claim={current}
                choice={choice}
                onNext={next}
                isLast={index === claims.length - 1}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {claims.map((claim, dotIndex) => (
          <span
            key={claim.id}
            className={clsx(
              "h-2 rounded-full transition-all",
              dotIndex === index
                ? "w-7 bg-hot"
                : dotIndex < index
                  ? "w-2 bg-true"
                  : "w-2 bg-line/20",
            )}
          />
        ))}
      </div>
    </div>
  );
}

function DailyReveal({
  claim,
  choice,
  onNext,
  isLast,
}: {
  claim: DailyClaim;
  choice: Verdict | null;
  onNext: () => void;
  isLast: boolean;
}) {
  const { t, settings } = useSettings();
  const correct = choice ? isGuessCorrect(choice, claim.verdict) : false;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-5 rounded-2xl border-2 border-line/15 bg-paper/70 p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p
          className={clsx(
            "font-display text-xl font-black",
            correct ? "text-true-deep dark:text-mint" : "text-false-deep dark:text-candy",
          )}
        >
          {correct ? t("daily.correct") : t("daily.wrong")}
        </p>
        <VerdictLabel
          verdict={claim.verdict}
          useSkin={settings.skin === "cap"}
          serious={settings.seriousMode || claim.category !== null}
          size="sm"
        />
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        {settings.language === "en"
          ? claim.explanation
          : claim.explanationHinglish}
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <a
          href={claim.source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-hot hover:underline"
        >
          {claim.source.publisher}
          <ExternalIcon className="h-3 w-3" />
        </a>
        <button type="button" onClick={onNext} className="btn-primary !min-h-10 !px-4 !py-2 !text-[10px]">
          {isLast ? t("daily.finish") : t("daily.next")}
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
