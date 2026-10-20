"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Language } from "@/lib/types";
import { translate, type TranslationKey } from "@/lib/i18n";

export type Theme = "dark" | "light";
export type Skin = "official" | "cap";

export interface Settings {
  theme: Theme;
  language: Language;
  skin: Skin;
  sound: boolean;
  haptics: boolean;
  reducedMotion: boolean;
  seriousMode: boolean;
  demoMode: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  theme: "dark",
  language: "en",
  skin: "cap",
  sound: false,
  haptics: true,
  reducedMotion: false,
  seriousMode: false,
  demoMode: true,
};

const STORAGE_KEY = "iit-settings-v1";

interface SettingsContextValue {
  settings: Settings;
  hydrated: boolean;
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  reset: () => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function applySettings(settings: Settings) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", settings.theme === "dark");
  document.documentElement.classList.toggle("light", settings.theme === "light");
  document.documentElement.classList.toggle(
    "reduced-motion",
    settings.reducedMotion,
  );
  document.documentElement.dataset.language = settings.language;
  document.documentElement.dataset.skin = settings.skin;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let loaded = DEFAULT_SETTINGS;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        loaded = { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Settings) };
      } else {
        loaded = {
          ...DEFAULT_SETTINGS,
          theme: media.matches ? "dark" : "dark",
          reducedMotion: media.matches,
        };
      }
    } catch {
      loaded = { ...DEFAULT_SETTINGS, reducedMotion: media.matches };
    }
    setSettings(loaded);
    applySettings(loaded);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    applySettings(settings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Storage may be unavailable in private contexts.
    }
  }, [settings, hydrated]);

  const update = useCallback(
    <K extends keyof Settings>(key: K, value: Settings[K]) => {
      setSettings((current) => ({ ...current, [key]: value }));
    },
    [],
  );

  const reset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    applySettings(DEFAULT_SETTINGS);
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) =>
      translate(settings.language, key, vars),
    [settings.language],
  );

  const value = useMemo(
    () => ({ settings, hydrated, update, reset, t }),
    [settings, hydrated, update, reset, t],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used inside SettingsProvider.");
  }
  return context;
}

export function useOptions() {
  const { settings } = useSettings();
  return useMemo(
    () => ({
      useSkin: settings.skin === "cap",
      reducedMotion: settings.reducedMotion,
      language: settings.language,
    }),
    [settings.skin, settings.reducedMotion, settings.language],
  );
}
