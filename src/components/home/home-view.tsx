"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useSettings } from "@/components/providers/settings-provider";
import { useCoins } from "@/components/providers/coins-provider";
import { useToast } from "@/components/providers/toast-provider";
import { useSound } from "@/components/providers/sound-provider";
import { HeroCanvas } from "@/components/three/hero-canvas";
import { VerdictLabel } from "@/components/ui/verdict-label";
import { DemoBadge } from "@/components/ui/demo-badge";
import {
  ArrowRightIcon,
  CoinIcon,
  GameIcon,
  LinkIcon,
  SearchIcon,
  SparkIcon,
  UploadIcon,
} from "@/components/icons";
import type { TrendingItem } from "@/lib/types";
import { getDailyPlayed } from "@/lib/local-db";
import { getDailyClaims } from "@/lib/daily-claims";
import { formatRelativeTime } from "@/lib/text";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export function HomeView() {
  const router = useRouter();
  const { t, settings, hydrated } = useSettings();
  const { balance, gullibilityScore, hydrated: coinsHydrated } = useCoins();
  const { toast } = useToast();
  const { unlock, play } = useSound();
  const [quickClaim, setQuickClaim] = useState("");
  const [quickError, setQuickError] = useState("");
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [dailyPlayed, setDailyPlayed] = useState<number | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { dayKey } = getDailyClaims();

  useEffect(() => {
    setDailyPlayed(getDailyPlayed(dayKey)?.score ?? null);
  }, [dayKey]);

  useEffect(() => {
    let active = true;
    setTrendingLoading(true);
    fetch(`/api/trending?lang=${settings.language}&limit=4`)
      .then((response) => (response.ok ? response.json() : { items: [] }))
      .then((data: { items?: TrendingItem[] }) => {
        if (active) setTrending(data.items ?? []);
      })
      .catch(() => {
        if (active) setTrending([]);
      })
      .finally(() => {
        if (active) setTrendingLoading(false);
      });
    return () => {
      active = false;
    };
  }, [settings.language]);

  function submitQuick(event: React.FormEvent) {
    event.preventDefault();
    unlock();
    play("whoosh");
    if (quickClaim.trim().length < 8) {
      setQuickError(t("verify.error.short"));
      inputRef.current?.focus();
      return;
    }
    setQuickError("");
    router.push(`/verify?claim=${encodeURIComponent(quickClaim.trim())}`);
  }

  return (
    <div className="page-shell">
      <section className="relative isolate grid items-center gap-3 overflow-hidden pb-8 pt-2 lg:min-h-[calc(100svh-7rem)] lg:grid-cols-[1.08fr_0.92fr] lg:gap-6 lg:pb-10 lg:pt-4">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="sticker -rotate-2 bg-hot/15 text-hot">
              <SparkIcon className="h-3.5 w-3.5" />
              {t("home.kicker")}
            </span>
            <span className="sticker rotate-1 bg-mint/30 text-true-deep dark:text-mint">
              {t("app.tagline")}
            </span>
            <DemoBadge />
          </div>

          <h1 className="giant-title mt-3 uppercase sm:mt-5">
            <span className="block text-muted/70">{t("home.title1")}</span>
            <span className="relative inline-block">
              <span className="relative z-10 text-hot">{t("home.title2")}</span>
              <span
                aria-hidden="true"
                className="absolute -bottom-2 left-1 h-4 w-[92%] -rotate-1 rounded-full bg-butter sm:h-6"
              />
              <span
                aria-hidden="true"
                className="absolute -right-4 -top-3 h-5 w-5 rotate-12 rounded-sm border-2 border-line/30 bg-mint sm:h-7 sm:w-7"
              />
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            {t("home.subtitle")}
          </p>

          <form onSubmit={submitQuick} className="mt-7 max-w-xl">
            <div className="flex flex-col gap-2.5">
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-4 top-5 h-5 w-5 text-muted" />
                <textarea
                  ref={inputRef}
                  value={quickClaim}
                  onChange={(event) => {
                    setQuickClaim(event.target.value.slice(0, 1800));
                    if (quickError) setQuickError("");
                  }}
                  placeholder={t("home.placeholder")}
                  rows={2}
                  maxLength={1800}
                  aria-label={t("verify.claimLabel")}
                  className="field min-h-[88px] w-full resize-none !rounded-[1.4rem] !py-4 pl-12 pr-4 text-sm shadow-clay-sm sm:text-base"
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      event.currentTarget.form?.requestSubmit();
                    }
                  }}
                />
              </div>
              <button
                type="submit"
                className="btn-primary h-12 w-full whitespace-nowrap !rounded-[1.4rem] !px-5 !py-0 !text-xs"
              >
                {t("common.check")}
                <ArrowRightIcon className="h-4 w-4 shrink-0" />
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2 px-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted/80">
                {t("home.inputHint")}
              </p>
              {quickError && (
                <p role="alert" className="text-[11px] font-bold text-false">
                  {quickError}
                </p>
              )}
            </div>
          </form>

          <p className="mt-4 max-w-md border-l-4 border-misleading pl-3 text-xs leading-relaxed text-muted">
            {t("home.trust")}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link href="/verify" className="btn-primary w-full sm:w-auto">
              {t("home.cta")}
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/daily"
              className="btn-secondary w-full sm:w-auto"
              onClick={() => {
                unlock();
                play("tick");
              }}
            >
              <GameIcon className="h-4 w-4" />
              {t("home.daily")}
            </Link>
          </div>
        </div>

        <div className="relative z-0 isolate order-first mx-auto mt-1 h-[220px] w-full max-w-md overflow-visible sm:h-[300px] lg:order-none lg:mx-0 lg:mt-4 lg:h-[min(520px,calc(100svh-10rem))] lg:max-w-none lg:self-center">
          <HeroCanvas />
          <div className="pointer-events-none absolute bottom-2 right-1 max-w-[46%] rotate-3 truncate rounded-lg border-2 border-line/25 bg-cream px-2 py-1 font-display text-[8px] font-extrabold uppercase tracking-[0.12em] shadow-sticker sm:bottom-10 sm:right-2 sm:max-w-none sm:px-3 sm:py-2 sm:text-[10px]">
            {t("home.noVibes")}
          </div>
        </div>
      </section>

      <section aria-labelledby="ways-title" className="mt-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">{t("home.ways")}</p>
            <h2 id="ways-title" className="section-title mt-2">
              {t("home.waysTitle")}
            </h2>
          </div>
          <span className="hidden rotate-2 rounded-lg bg-clay px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest text-muted sm:block">
            {t("home.waysSticker")}
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              href: "/verify?mode=text",
              title: t("home.way1"),
              sub: t("home.way1sub"),
              Icon: SearchIcon,
              color: "bg-hot",
              text: "text-[#1a0e08]",
              tilt: "-rotate-1",
              sticker: "Paste",
            },
            {
              href: "/verify?mode=reel",
              title: t("home.way2"),
              sub: t("home.way2sub"),
              Icon: LinkIcon,
              color: "bg-sky",
              text: "text-[#10283a]",
              tilt: "rotate-1 md:translate-y-5",
              sticker: "Reel",
            },
            {
              href: "/verify?mode=media",
              title: t("home.way3"),
              sub: t("home.way3sub"),
              Icon: UploadIcon,
              color: "bg-mint",
              text: "text-[#073a24]",
              tilt: "-rotate-[0.6deg]",
              sticker: "Upload",
            },
          ].map(({ href, title, sub, Icon, color, text, tilt, sticker }) => (
            <motion.div
              key={href}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45 }}
              className={tilt}
            >
              <Link
                href={href}
                className="clay-card group flex h-full flex-col p-5 transition-transform duration-200 hover:-translate-y-1.5 hover:rotate-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`flex h-12 w-12 -rotate-3 items-center justify-center rounded-2xl border-2 border-line/20 ${color} ${text} shadow-sticker`}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="sticker rotate-2 bg-cream text-muted">
                    {sticker}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-2xl font-extrabold leading-none">
                  {title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                  {sub}
                </p>
                <span className="mt-5 inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-hot">
                  {t("home.open")} <ArrowRightIcon className="h-3.5 w-3.5" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="clay-card overflow-hidden p-5 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">{t("home.trending")}</p>
              <h2 className="section-title mt-2">{t("trending.title")}</h2>
            </div>
            <Link
              href="/trending"
              className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-hot hover:underline"
            >
              {t("home.trendingCta")} <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {trendingLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-28 animate-pulse rounded-xl border border-line/10 bg-clay/50"
                />
              ))
            ) : trending.length > 0 ? (
              trending.map((item, index) => (
                <Link
                  key={item.id}
                  href={`/results/${item.id}`}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-xl border-2 border-line/15 bg-paper/55 p-4 transition-transform hover:-translate-y-0.5"
                  style={{ transform: `rotate(${index % 2 ? 0.6 : -0.5}deg)` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-muted">
                      {item.checks} {t("trending.checks")} ·{" "}
                      {formatRelativeTime(item.lastCheckedAt, settings.language)}
                    </span>
                    <VerdictLabel
                      verdict={item.verdict}
                      useSkin={settings.skin === "cap"}
                      serious={item.sensitive || settings.seriousMode}
                      size="sm"
                    />
                  </div>
                  <p className="mt-3 line-clamp-2 font-display text-base font-bold leading-snug group-hover:text-hot">
                    {item.claim}
                  </p>
                  {item.sensitive && (
                    <span className="mt-2 text-[9px] font-bold uppercase tracking-wider text-unverified-deep dark:text-unverified">
                      {t("common.serious")}
                    </span>
                  )}
                </Link>
              ))
            ) : (
              <p className="col-span-full py-8 text-center text-sm text-muted">
                {t("trending.empty")}
              </p>
            )}
          </div>
        </div>

        <div className="relative flex flex-col gap-4">
          <div className="clay-card-alt relative overflow-hidden p-5">
            <div className="absolute -right-6 -top-6 h-24 w-24 rotate-12 rounded-full border-[10px] border-misleading/20" />
            <p className="eyebrow">{t("home.coins")}</p>
            <div className="mt-3 flex items-end gap-2">
              <CoinIcon className="mb-1 h-7 w-7 text-misleading" />
              <span className="font-display text-5xl font-black leading-none">
                {coinsHydrated ? balance : "—"}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              {t("home.coinHint")}
            </p>
            <p className="mt-3 rounded-lg border border-line/15 bg-paper/55 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted">
              {t("coins.rules")}
            </p>
            <div className="mt-4 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider">
              <span className="text-muted">{t("home.gullibility")}</span>
              <span className="rounded-full bg-cream px-2 py-1">
                {coinsHydrated ? gullibilityScore : "—"}/100
              </span>
            </div>
            <Link
              href="/settings"
              className="mt-4 inline-flex text-[10px] font-extrabold uppercase tracking-widest text-hot hover:underline"
            >
              {t("home.openJar")}
            </Link>
          </div>

          <div className="relative overflow-hidden rounded-[1.8rem] border-2 border-line/20 bg-misleading p-5 text-[#3c2600] shadow-clay">
            <div className="absolute -right-4 -top-4 rotate-12 rounded bg-[#ffe28a] px-3 py-1 text-[9px] font-extrabold uppercase tracking-widest shadow">
              {t("home.dailySticker")}
            </div>
            <GameIcon className="h-8 w-8" />
            <h3 className="mt-3 font-display text-2xl font-black leading-none">
              {t("daily.title")}
            </h3>
            <p className="mt-2 text-xs font-semibold leading-relaxed text-[#3c2600]/80">
              {t("home.dailySub")}
            </p>
            <Link
              href="/daily"
              className="mt-4 inline-flex items-center gap-1 rounded-xl border-2 border-[#3c2600]/30 bg-[#3c2600] px-4 py-2 text-[10px] font-extrabold uppercase tracking-widest text-butter"
            >
              {dailyPlayed !== null
                ? `${t("daily.score", { score: dailyPlayed })}`
                : t("common.check")}
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="relative mt-16 overflow-hidden rounded-[2rem] border-2 border-line/20 bg-cream px-5 py-12 text-center shadow-clay sm:px-10">
        <div className="absolute inset-x-0 top-0 h-3 ribbon opacity-70" />
        <span className="sticker rotate-2 bg-butter">
          {t("footer.built")}
        </span>
        <h2 className="mx-auto mt-5 max-w-2xl font-display text-4xl font-black leading-[0.95] sm:text-5xl">
          {t("home.finalTitle")}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted">
          {t("home.trust")}
        </p>
        <button
          type="button"
          className="btn-primary mt-6"
          onClick={() => {
            if (quickClaim.trim().length >= 8) {
              router.push(`/verify?claim=${encodeURIComponent(quickClaim.trim())}`);
            } else {
              inputRef.current?.focus();
              window.scrollTo({ top: 0, behavior: "smooth" });
              toast(t("home.pasteFirst"), "default");
            }
          }}
        >
          {t("home.cta")}
          <ArrowRightIcon className="h-4 w-4" />
        </button>
        {hydrated && settings.language === "hinglish" && (
          <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-muted">
            {t("home.langHint")}
          </p>
        )}
      </section>
    </div>
  );
}
