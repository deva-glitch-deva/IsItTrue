"use client";

import { useEffect, useState } from "react";
import type { ProviderStatus } from "@/lib/types";
import { useSettings } from "@/components/providers/settings-provider";

interface StatusResponse {
  providers: ProviderStatus & { demo: boolean };
}

export function DemoBadge({ compact = false }: { compact?: boolean }) {
  const [demo, setDemo] = useState(false);
  const { t } = useSettings();

  useEffect(() => {
    let active = true;
    fetch("/api/status")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: StatusResponse | null) => {
        if (active && data) setDemo(Boolean(data.providers.demo));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  if (!demo) return null;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-misleading/40 bg-misleading/15 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.16em] text-misleading-deep dark:text-butter"
      title="Live provider keys are missing. Realistic sample data is being used."
    >
      <span className="h-1.5 w-1.5 animate-blink rounded-full bg-misleading" />
      {compact ? "Demo" : t("common.demo")}
    </span>
  );
}
