"use client";

import { useEffect } from "react";
import { useSettings } from "./settings-provider";
import { listHistory, seedDemoHistory } from "@/lib/local-db";

const FLAG = "iit-demo-seeded-v1";

export function DemoSeeder() {
  const { settings, hydrated } = useSettings();

  useEffect(() => {
    if (!hydrated || !settings.demoMode) return;
    try {
      if (localStorage.getItem(FLAG)) return;
    } catch {
      return;
    }
    void (async () => {
      const existing = await listHistory().catch(() => []);
      if (existing.length === 0) {
        await seedDemoHistory().catch(() => undefined);
      }
      try {
        localStorage.setItem(FLAG, "1");
      } catch {
        // Ignore storage failures.
      }
    })();
  }, [hydrated, settings.demoMode]);

  return null;
}
