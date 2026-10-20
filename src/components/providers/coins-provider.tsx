"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DAILY_COIN_CAP, STARTING_COINS } from "@/lib/constants";
import { isClockRollback } from "@/lib/coins";

interface CoinState {
  balance: number;
  earnedToday: number;
  dayKey: string;
  gullibilityScore: number;
  betsPlaced: number;
  correctCalls: number;
}

const STORAGE_KEY = "iit-coins-v1";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

const DEFAULT_COIN_STATE: CoinState = {
  balance: STARTING_COINS,
  earnedToday: 0,
  dayKey: todayKey(),
  gullibilityScore: 50,
  betsPlaced: 0,
  correctCalls: 0,
};

interface CoinsContextValue extends CoinState {
  earn: (amount: number) => { awarded: number; capped: boolean };
  spendBet: (amount: number) => boolean;
  payout: (amount: number) => void;
  recordGuess: (correct: boolean) => { gullibilityScore: number };
  reset: () => void;
}

const CoinsContext = createContext<CoinsContextValue | null>(null);

function freshState(state: CoinState): CoinState {
  const key = todayKey();
  if (state.dayKey === key) return state;
  if (isClockRollback(state.dayKey, key)) return state;
  return { ...state, dayKey: key, earnedToday: 0 };
}

function persist(state: CoinState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors.
  }
}

export function CoinsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CoinState>(DEFAULT_COIN_STATE);
  const stateRef = useRef<CoinState>(DEFAULT_COIN_STATE);
  const [hydrated, setHydrated] = useState(false);

  const commit = useCallback((next: CoinState) => {
    stateRef.current = next;
    setState(next);
    persist(next);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw
        ? { ...DEFAULT_COIN_STATE, ...(JSON.parse(raw) as CoinState) }
        : DEFAULT_COIN_STATE;
      const refreshed = freshState(parsed);
      stateRef.current = refreshed;
      setState(refreshed);
      persist(refreshed);
    } catch {
      stateRef.current = DEFAULT_COIN_STATE;
      setState(DEFAULT_COIN_STATE);
    }
    setHydrated(true);
  }, []);

  const earn = useCallback(
    (amount: number) => {
      const current = freshState(stateRef.current);
      const room = Math.max(0, DAILY_COIN_CAP - current.earnedToday);
      const awarded = Math.min(room, Math.max(0, Math.round(amount)));
      commit({
        ...current,
        balance: current.balance + awarded,
        earnedToday: current.earnedToday + awarded,
      });
      return { awarded, capped: room <= 0 };
    },
    [commit],
  );

  const spendBet = useCallback(
    (amount: number) => {
      const current = freshState(stateRef.current);
      if (current.balance < amount || amount <= 0) return false;
      commit({ ...current, balance: current.balance - amount });
      return true;
    },
    [commit],
  );

  const payout = useCallback(
    (amount: number) => {
      if (amount <= 0) return;
      const current = freshState(stateRef.current);
      commit({ ...current, balance: current.balance + Math.round(amount) });
    },
    [commit],
  );

  const recordGuess = useCallback(
    (correct: boolean) => {
      const current = freshState(stateRef.current);
      const betsPlaced = current.betsPlaced + 1;
      const correctCalls = current.correctCalls + (correct ? 1 : 0);
      const rate = correctCalls / betsPlaced;
      const gullibilityScore = Math.round(
        Math.max(0, Math.min(100, 50 + (0.5 - rate) * 100)),
      );
      commit({
        ...current,
        betsPlaced,
        correctCalls,
        gullibilityScore,
      });
      return { gullibilityScore };
    },
    [commit],
  );

  const reset = useCallback(() => {
    commit({ ...DEFAULT_COIN_STATE, dayKey: todayKey() });
  }, [commit]);

  const value = useMemo(
    () => ({ ...state, earn, spendBet, payout, recordGuess, reset, hydrated }),
    [state, earn, spendBet, payout, recordGuess, reset, hydrated],
  );

  return <CoinsContext.Provider value={value}>{children}</CoinsContext.Provider>;
}

export function useCoins(): CoinsContextValue & { hydrated: boolean } {
  const context = useContext(CoinsContext);
  if (!context) throw new Error("useCoins must be used inside CoinsProvider.");
  return context as CoinsContextValue & { hydrated: boolean };
}
