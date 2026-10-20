"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";
import { useSettings } from "./settings-provider";

type SoundName = "thud" | "coin" | "whoosh" | "buzz" | "tick";

interface HowlLike {
  play: () => number;
  volume: (value: number) => unknown;
}

const FILES: Record<SoundName, string> = {
  thud: "/sounds/thud.wav",
  coin: "/sounds/coin.wav",
  whoosh: "/sounds/whoosh.wav",
  buzz: "/sounds/buzz.wav",
  tick: "/sounds/tick.wav",
};

interface SoundContextValue {
  play: (name: SoundName) => void;
  unlock: () => void;
}

const SoundContext = createContext<SoundContextValue>({
  play: () => undefined,
  unlock: () => undefined,
});

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const howls = useRef<Partial<Record<SoundName, HowlLike>>>({});
  const loaded = useRef(false);

  const load = useCallback(async () => {
    if (loaded.current) return;
    loaded.current = true;
    try {
      const mod = await import("howler");
      const Howler = mod.Howl;
      for (const [name, src] of Object.entries(FILES) as Array<
        [SoundName, string]
      >) {
        howls.current[name] = new Howler({
          src: [src],
          volume: name === "thud" ? 0.7 : 0.45,
          preload: true,
        });
      }
    } catch {
      loaded.current = false;
    }
  }, []);

  const unlock = useCallback(() => {
    void load();
  }, [load]);

  const play = useCallback(
    (name: SoundName) => {
      if (!settings.sound || settings.seriousMode) return;
      void (async () => {
        await load();
        try {
          howls.current[name]?.play();
        } catch {
          // Audio can be blocked until a trusted gesture.
        }
      })();
    },
    [settings.sound, settings.seriousMode, load],
  );

  const value = useMemo(() => ({ play, unlock }), [play, unlock]);

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound(): SoundContextValue {
  return useContext(SoundContext);
}

export function vibrate(pattern: number | number[]) {
  if (typeof navigator === "undefined") return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // Not supported.
  }
}
