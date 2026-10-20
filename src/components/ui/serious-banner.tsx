"use client";

import { useSettings } from "@/components/providers/settings-provider";
import { ShieldIcon } from "@/components/icons";

export function SeriousBanner({ topic = false }: { topic?: boolean }) {
  const { t } = useSettings();
  return (
    <div className="flex items-start gap-3 rounded-2xl border-2 border-unverified/40 bg-unverified/10 px-4 py-3 text-sm">
      <ShieldIcon className="mt-0.5 h-5 w-5 shrink-0 text-unverified-deep dark:text-unverified" />
      <div>
        <p className="font-extrabold">{t("serious.banner")}</p>
        {topic && (
          <p className="mt-0.5 text-xs text-muted">{t("serious.topic")}</p>
        )}
      </div>
    </div>
  );
}
