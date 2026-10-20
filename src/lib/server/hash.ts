import { createHash } from "node:crypto";
import { normalizeClaim } from "../text";
import type { Language } from "../types";

export function claimHash(text: string, language: Language): string {
  return createHash("sha256")
    .update(`${normalizeClaim(text)}::${language}`)
    .digest("hex");
}

export function shortHash(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}
