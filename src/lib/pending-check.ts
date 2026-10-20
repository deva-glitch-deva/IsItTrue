"use client";

import type { Language } from "./types";

export type VerifyMode = "text" | "reel" | "media";

export interface PendingCheck {
  mode: VerifyMode;
  language: Language;
  claim?: string;
  reelUrl?: string;
  caption?: string;
  file?: File;
  createdAt: number;
}

let pending: PendingCheck | null = null;

export function setPendingCheck(value: PendingCheck): void {
  pending = value;
}

export function getPendingCheck(): PendingCheck | null {
  if (!pending) return null;
  if (Date.now() - pending.createdAt > 20 * 60 * 1000) {
    pending = null;
    return null;
  }
  return pending;
}

export function clearPendingCheck(): void {
  pending = null;
}
