"use client";

import { SettingsProvider } from "./settings-provider";
import { CoinsProvider } from "./coins-provider";
import { SoundProvider } from "./sound-provider";
import { ToastProvider } from "./toast-provider";
import { SmoothScroll } from "./smooth-scroll";
import { ServiceWorker } from "./service-worker";
import { DemoSeeder } from "./demo-seeder";
import { CoinShower } from "@/components/ui/coin-shower";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <CoinsProvider>
        <SoundProvider>
          <ToastProvider>
            <SmoothScroll />
            <ServiceWorker />
            <DemoSeeder />
            <CoinShower />
            {children}
          </ToastProvider>
        </SoundProvider>
      </CoinsProvider>
    </SettingsProvider>
  );
}
