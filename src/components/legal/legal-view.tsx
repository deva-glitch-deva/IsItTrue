"use client";

import Link from "next/link";
import { useSettings } from "@/components/providers/settings-provider";
import { ShieldIcon } from "@/components/icons";

export function LegalView({ kind }: { kind: "privacy" | "terms" }) {
  const { t } = useSettings();
  const privacy = kind === "privacy";
  return (
    <div className="mx-auto max-w-2xl">
      <span className="sticker -rotate-2 bg-mint/40">
        <ShieldIcon className="h-4 w-4" />
        {privacy ? t("privacy.title") : t("terms.title")}
      </span>
      <h1 className="section-title mt-3">
        {privacy ? t("privacy.title") : t("terms.title")}
      </h1>
      {privacy ? (
        <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted">
          <p>{t("settings.privacyText")}</p>
          <p>
            History, coins, Guess First bets and Daily Game scores live in this
            browser (IndexedDB and localStorage). Clearing device data in
            Settings deletes them.
          </p>
          <p>
            Shared cache stores a hash of the normalized claim plus language for
            up to 7 days. No account, email, phone number or IP is attached.
            Uploaded media is processed in memory and not stored.
          </p>
          <p>
            Anonymous disagree-feedback stores only a result id, a verdict label
            and an optional note. Trending hides hateful, dangerous and personal
            content.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted">
          <p>{t("footer.disclaimer")}</p>
          <p>
            Results are AI-assisted estimates. Thin evidence stays Unverified.
            True or False needs at least two independent public sources. This is
            not legal, medical or financial advice.
          </p>
          <p>
            Play coins have no real-world value. There are no purchases and no
            cash-out. Guess First and Daily Game are optional and lock off in
            Serious Mode.
          </p>
          <p>
            Do not use this app to harass private individuals, collect personal
            data, or bypass platform rules. Instagram captions are fetched only
            from public oEmbed when available.
          </p>
        </div>
      )}
      <div className="mt-6 flex gap-3">
        <Link href="/how-it-works" className="btn-secondary">
          {t("nav.how")}
        </Link>
        <Link href="/settings" className="btn-secondary">
          {t("nav.settings")}
        </Link>
      </div>
    </div>
  );
}
