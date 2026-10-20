"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useSettings } from "@/components/providers/settings-provider";
import {
  ClockIcon,
  FlameIcon,
  GameIcon,
  HomeIcon,
  SettingsIcon,
} from "@/components/icons";

const ITEMS = [
  { href: "/", key: "nav.home" as const, short: "Home", Icon: HomeIcon },
  { href: "/trending", key: "nav.trending" as const, short: "Hot", Icon: FlameIcon },
  { href: "/daily", key: "nav.daily" as const, short: "Daily", Icon: GameIcon },
  { href: "/history", key: "nav.history" as const, short: "Past", Icon: ClockIcon },
  { href: "/settings", key: "nav.settings" as const, short: "Set", Icon: SettingsIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useSettings();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-line/15 bg-cream pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(0,0,0,0.12)] md:hidden"
    >
      <div className="grid grid-cols-5">
        {ITEMS.map(({ href, key, short, Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={t(key)}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "relative flex min-h-[58px] min-w-0 flex-col items-center justify-center gap-0.5 px-0.5 pt-2 text-[8px] font-extrabold uppercase tracking-[0.02em] transition-colors",
                active ? "text-hot" : "text-muted",
              )}
            >
              {active && (
                <span className="absolute top-1 h-1 w-5 rounded-full bg-hot" />
              )}
              <Icon className={clsx("h-5 w-5 shrink-0", active && "-rotate-6")} />
              <span className="max-w-full truncate leading-none">{short}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
