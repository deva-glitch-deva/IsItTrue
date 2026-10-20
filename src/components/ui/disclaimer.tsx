"use client";

import { useSettings } from "@/components/providers/settings-provider";
import { ShieldIcon } from "@/components/icons";

export function Disclaimer({
  compact = false,
  serious = false,
}: {
  compact?: boolean;
  serious?: boolean;
}) {
  const { t } = useSettings();
  return (
    <div
      className={
        serious
          ? "flex items-start gap-3 rounded-xl border border-line/15 bg-clay/40 px-4 py-3 text-xs text-muted"
          : "flex items-start gap-3 rounded-xl border-2 border-dashed border-line/20 px-4 py-3 text-xs text-muted"
      }
    >
      <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0" />
      <p className={compact ? "" : "font-semibold"}>
        {t("results.disclaimer")}
      </p>
    </div>
  );
}
