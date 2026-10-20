"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useSettings } from "@/components/providers/settings-provider";

const BURST_EVENT = "iit-coin-burst";

interface BurstCoin {
  id: string;
  left: number;
  delay: number;
  duration: number;
  size: number;
  drift: number;
  spin: number;
}

interface Burst {
  id: number;
  amount: number;
  coins: BurstCoin[];
}

export function emitCoinBurst(amount: number) {
  if (typeof window === "undefined" || amount <= 0) return;
  window.dispatchEvent(
    new CustomEvent(BURST_EVENT, { detail: { amount } }),
  );
}

function buildCoins(amount: number): BurstCoin[] {
  const count = Math.min(18, Math.max(8, Math.round(amount)));
  return Array.from({ length: count }, (_, index) => ({
    id: `${Date.now()}-${index}`,
    left: 6 + Math.random() * 88,
    delay: Math.random() * 180,
    duration: 780 + Math.random() * 720,
    size: 14 + Math.random() * 16,
    drift: (Math.random() - 0.5) * 120,
    spin: 180 + Math.random() * 420,
  }));
}

export function CoinShower() {
  const { settings } = useSettings();
  const [bursts, setBursts] = useState<Burst[]>([]);
  const reduced = settings.reducedMotion || settings.seriousMode;

  useEffect(() => {
    if (settings.seriousMode) return;
    const onBurst = (event: Event) => {
      const amount = Number(
        (event as CustomEvent<{ amount?: number }>).detail?.amount ?? 0,
      );
      if (amount <= 0) return;
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setBursts((current) => [
        ...current.slice(-1),
        { id, amount, coins: reduced ? [] : buildCoins(amount) },
      ]);
      window.setTimeout(() => {
        setBursts((current) => current.filter((burst) => burst.id !== id));
      }, reduced ? 1400 : 1700);
    };
    window.addEventListener(BURST_EVENT, onBurst);
    return () => window.removeEventListener(BURST_EVENT, onBurst);
  }, [reduced, settings.seriousMode]);

  if (settings.seriousMode || bursts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[95] overflow-hidden"
      aria-hidden="true"
    >
      {bursts.map((burst) =>
        reduced ? (
          <div
            key={burst.id}
            className="absolute left-1/2 top-16 -translate-x-1/2 rounded-full border-2 border-misleading/50 bg-butter px-4 py-2 font-display text-lg font-black text-[#5e3a00] shadow-sticker"
          >
            +{burst.amount}
          </div>
        ) : (
          burst.coins.map((coin) => (
            <span
              key={coin.id}
              className="coin-fall absolute top-[-8%] rounded-full border-2 border-[#9a5d00] bg-[#f5a623] shadow-[inset_0_0_0_3px_#ffe28a]"
              style={
                {
                  left: `${coin.left}%`,
                  width: coin.size,
                  height: coin.size,
                  animationDelay: `${coin.delay}ms`,
                  animationDuration: `${coin.duration}ms`,
                  "--coin-drift": `${coin.drift}px`,
                  "--coin-spin": `${coin.spin}deg`,
                } as CSSProperties
              }
            />
          ))
        ),
      )}
    </div>
  );
}
