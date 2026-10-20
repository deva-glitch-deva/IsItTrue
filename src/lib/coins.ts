export const MIN_BET = 5;

export function maxBetFor(balance: number): number {
  if (balance < MIN_BET) return 0;
  return Math.max(MIN_BET, Math.floor(balance * 0.5));
}

export function betOptions(balance: number): number[] {
  const cap = maxBetFor(balance);
  if (cap < MIN_BET) return [];
  const preset = [5, 10, 25, 50].filter((amount) => amount <= cap);
  if (!preset.includes(cap)) preset.push(cap);
  return [...new Set(preset)].sort((a, b) => a - b);
}

export function winPayout(bet: number): number {
  return bet * 2;
}

export function dailyStreakBonus(streak: number): number {
  if (streak <= 1) return 0;
  return Math.min(15, (streak - 1) * 2);
}

export type GullibilityBadge =
  | "sharp"
  | "skeptical"
  | "balanced"
  | "trusting"
  | "open";

export function gullibilityBadge(score: number): GullibilityBadge {
  if (score <= 20) return "sharp";
  if (score <= 40) return "skeptical";
  if (score <= 60) return "balanced";
  if (score <= 80) return "trusting";
  return "open";
}

export function nextCalendarDay(dayKey: string): string {
  const date = new Date(`${dayKey}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

export function isClockRollback(previousDay: string, currentDay: string): boolean {
  return currentDay < previousDay;
}
