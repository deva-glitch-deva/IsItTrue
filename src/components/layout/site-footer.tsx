"use client";

import Link from "next/link";
import { useSettings } from "@/components/providers/settings-provider";
import { ShieldIcon } from "@/components/icons";

export function SiteFooter() {
  const { t } = useSettings();
  return (
    <footer className="relative z-10 mt-12 border-t border-line/10 px-4 pb-28 pt-8 sm:px-6 md:pb-10 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-2xl font-extrabold">
            is it <span className="text-hot">true?</span>
          </p>
          <p className="mt-1 text-xs text-muted">{t("footer.built")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] font-bold uppercase tracking-[0.11em] text-muted">
          <Link href="/how-it-works" className="hover:text-ink">
            {t("nav.how")}
          </Link>
          <Link href="/privacy" className="hover:text-ink">
            {t("nav.privacy")}
          </Link>
          <Link href="/terms" className="hover:text-ink">
            {t("nav.terms")}
          </Link>
          <span className="inline-flex items-center gap-1">
            <ShieldIcon className="h-3.5 w-3.5" />
            {t("footer.privacy")}
          </span>
          <span>{t("footer.disclaimer")}</span>
        </div>
      </div>
    </footer>
  );
}
