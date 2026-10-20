import type { Verdict } from "./types";

export const APP_NAME = "Is It True";
export const DISCLAIMER = "AI-assisted estimate, not absolute truth.";
export const DISCLAIMER_HINGLISH =
  "AI ka estimate hai, absolute truth nahi. Apni research bhi karein.";

export const VERDICT_META: Record<
  Verdict,
  {
    official: string;
    skin: string;
    color: string;
    deep: string;
    bg: string;
    text: string;
    stamp: string;
    angle: number;
  }
> = {
  TRUE: {
    official: "True",
    skin: "No Cap",
    color: "#1fae6a",
    deep: "#0c6e42",
    bg: "#d9f7e8",
    text: "#064d2d",
    stamp: "TRUE",
    angle: -38,
  },
  FALSE: {
    official: "False",
    skin: "Cap",
    color: "#ef4444",
    deep: "#9d1c1c",
    bg: "#ffe0dc",
    text: "#6e1212",
    stamp: "FALSE",
    angle: -44,
  },
  MISLEADING: {
    official: "Misleading",
    skin: "Sus",
    color: "#f5a623",
    deep: "#9a5d00",
    bg: "#fff0c7",
    text: "#5e3a00",
    stamp: "MISLEADING",
    angle: -41,
  },
  UNVERIFIED: {
    official: "Unverified",
    skin: "Idk Bro",
    color: "#8b949b",
    deep: "#4d565c",
    bg: "#e9ecee",
    text: "#353c41",
    stamp: "UNVERIFIED",
    angle: -36,
  },
};

export const VERDICTS: Verdict[] = [
  "TRUE",
  "FALSE",
  "MISLEADING",
  "UNVERIFIED",
];

export const CACHE_DAYS = 7;
export const RATE_LIMIT = 8;
export const RATE_WINDOW_MS = 60_000;
export const MAX_INPUT = 1800;
export const MAX_FILE_BYTES = 25 * 1024 * 1024;
export const DAILY_COIN_CAP = 60;
export const STARTING_COINS = 100;
export const FRESH_CHECK_REWARD = 10;
export const CACHED_CHECK_REWARD = 3;
export const DAILY_CORRECT_REWARD = 5;
export const DAILY_COMPLETION_REWARD = 5;
export const MIN_BET = 5;
export const MAX_HISTORY = 100;
export const SOURCE_KIND_LABEL: Record<
  "official" | "news" | "fact-checker" | "encyclopedia" | "social" | "unknown",
  string
> = {
  official: "Official",
  news: "Major news",
  "fact-checker": "Fact-checker",
  encyclopedia: "Encyclopedia",
  social: "Social",
  unknown: "Unknown",
};
