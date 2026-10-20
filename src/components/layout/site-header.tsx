"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useSettings } from "@/components/providers/settings-provider";
import { useSound } from "@/components/providers/sound-provider";
import { CoinPill } from "@/components/ui/coin-pill";
import { DemoBadge } from "@/components/ui/demo-badge";
import { MoonIcon, SearchIcon, SunIcon } from "@/components/icons";

const LINKS = [
  { href: "/", key: "nav.home" as const },
  { href: "/trending", key: "nav.trending" as const },
  { href: "/daily", key: "nav.daily" as const },
  { href: "/history", key: "nav.history" as const },
  { href: "/how-it-works", key: "nav.how" as const },
  { href: "/settings", key: "nav.settings" as const },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { t, settings, update } = useSettings();
  const { unlock } = useSound();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-line/10 bg-paper/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-2 overflow-hidden px-3 sm:h-16 sm:gap-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex min-w-0 flex-1 items-center gap-2 overflow-hidden sm:flex-none sm:gap-2.5"
          aria-label={`${t("app.tagline")} — home`}
          onClick={() => unlock()}
        >
          <span className="relative flex h-8 w-8 shrink-0 -rotate-3 items-center justify-center rounded-xl border-2 border-line/30 bg-hot shadow-sticker transition-transform group-hover:rotate-3 sm:h-9 sm:w-9">
            <SearchIcon className="h-4 w-4 text-[#1a0e08] sm:h-5 sm:w-5" />
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full border border-line/20 bg-butter sm:h-2.5 sm:w-2.5" />
          </span>
          <span className="min-w-0 truncate font-display text-lg font-extrabold leading-none tracking-tight sm:text-xl">
            is it <span className="text-hot">true?</span>
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 md:flex"
        >
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "rounded-full px-3.5 py-2 text-xs font-extrabold uppercase tracking-[0.08em] transition-colors",
                isActive(link.href)
                  ? "bg-ink text-paper"
                  : "text-muted hover:bg-clay hover:text-ink",
              )}
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <span className="hidden sm:inline-flex">
            <DemoBadge compact />
          </span>
          <button
            type="button"
            onClick={() => {
              unlock();
              update("theme", settings.theme === "dark" ? "light" : "dark");
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line/20 text-muted transition-colors hover:bg-clay hover:text-ink sm:h-9 sm:w-9"
            aria-label={
              settings.theme === "dark"
                ? t("settings.light")
                : t("settings.dark")
            }
          >
            {settings.theme === "dark" ? (
              <SunIcon className="h-4 w-4" />
            ) : (
              <MoonIcon className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              unlock();
              update(
                "language",
                settings.language === "en" ? "hinglish" : "en",
              );
            }}
            className="hidden h-9 items-center rounded-full border border-line/20 px-2.5 text-[10px] font-extrabold uppercase tracking-wider text-muted transition-colors hover:bg-clay hover:text-ink sm:inline-flex"
            aria-label={`Switch language to ${settings.language === "en" ? "Hinglish" : "English"}`}
          >
            {settings.language === "en" ? "EN" : "HI"}
          </button>
          <div className="hidden sm:block">
            <CoinPill linked />
          </div>
          <Link
            href="/verify"
            className="btn-primary !h-8 !min-h-8 !w-auto shrink-0 whitespace-nowrap !rounded-full !px-2.5 !py-0 !text-[10px] !tracking-normal sm:!h-9 sm:!min-h-9 sm:!px-4"
          >
            <SearchIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">{t("nav.verify")}</span>
            <span className="sm:hidden">Go</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
