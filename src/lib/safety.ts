import type { SeriousCategory } from "./types";

const CATEGORY_PATTERNS: Array<{
  category: Exclude<SeriousCategory, null>;
  pattern: RegExp;
}> = [
  {
    category: "health",
    pattern:
      /\b(cancer|tumou?r|covid|vaccine|vaccination|medicine|medication|drug|dosage|cure|treatment|therapy|pregnan\w*|abortion|diabetes|heart attack|stroke|depression|anxiety|mental health|suicide|doctor|hospital|disease|virus|infection|health)\b/i,
  },
  {
    category: "disaster",
    pattern:
      /\b(earthquake|tsunami|cyclone|hurricane|tornado|flood|wildfire|landslide|volcano|eruption|disaster|evacuat\w*|emergency alert|pandemic|famine|heatwave|storm)\b/i,
  },
  {
    category: "violence",
    pattern:
      /\b(murder|killed|killing|shooting|gunman|bomb|blast|attack|terror\w*|war|genocide|massacre|riot|lynch\w*|rape|assault|hostage|militant|army|airstrike)\b/i,
  },
  {
    category: "religion",
    pattern:
      /\b(hindu|muslim|sikh|christian|jewish|buddhist|church|mosque|temple|gurdwara|synagogue|religion|religious|caste|communal|quran|koran|bible|gita|torah|prophet|god|allah|ram|jesus)\b/i,
  },
  {
    category: "election",
    pattern:
      /\b(election|elections|ballot|voter fraud|polling booth|evm|vote rigging|electoral|campaign finance|prime minister candidate|presidential candidate)\b/i,
  },
];

const HATEFUL_PATTERNS = [
  /\b(kill|exterminate|wipe out|gas|burn)\s+(all\s+)?(people|community|religion|race|immigrants?)\b/i,
  /\b(hate|inferior)\s+(all\s+)?(people|community|religion|race)\b/i,
  /\b(terrorist|traitor)s?\s+(should|must)\s+(die|be killed)\b/i,
  /\b(subhuman|vermin|filth)\b/i,
];

const DANGEROUS_PATTERNS = [
  /\bhow\s+to\s+(make|build|assemble)\s+(a\s+)?(bomb|explosive|gun|weapon|poison)\b/i,
  /\b(kill|hurt)\s+(yourself|urself)\b/i,
  /\b(kys|unalive yourself)\b/i,
  /\b(lethal|deadly)\s+dose\s+of\b/i,
  /\b(join|contact)\s+(isis|al[-\s]?qaeda|terror group)\b/i,
  /\b(evade|bypass)\s+(police|law enforcement|security)\b/i,
];

const PERSONAL_PATTERNS = [
  /[\w.+-]+@[\w-]+\.[\w.]{2,}/,
  /(?:\+?\d[\s-]?){8,15}/,
  /\b\d{1,5}\s+[A-Za-z][A-Za-z\s]{2,30}\b(?:street|st|road|rd|avenue|ave|lane|ln|block|floor|flat|sector)\b/i,
  /\b(?:his|her|their)\s+(?:phone|number|address|aadhaar|passport|bank account)\b/i,
  /\b(?:doxx?|leaked)\s+(?:address|number|details|photos?)\b/i,
  /\b(?:phone|mobile|whatsapp)\s*(?:no|number|num)?\s*[:#]?\s*\d{8,}/i,
];

const PRIVATE_NAME_PATTERNS = [
  /\b(?:my neighbour|my neighbor|my classmate|my teacher|my cousin)\s+[A-Z][a-z]+\s+[A-Z][a-z]+\b/,
  /\b(?:doxx?ing|private photos? of)\s+[A-Z][a-z]+\b/i,
];

export interface SafetyClassification {
  serious: boolean;
  category: SeriousCategory;
  reasons: string[];
}

export function classifySensitive(text: string): SafetyClassification {
  const reasons: string[] = [];
  for (const { category, pattern } of CATEGORY_PATTERNS) {
    if (pattern.test(text)) {
      reasons.push(category);
      return { serious: true, category, reasons };
    }
  }
  return { serious: false, category: null, reasons };
}

export function detectCategories(text: string): SeriousCategory[] {
  return CATEGORY_PATTERNS.filter(({ pattern }) => pattern.test(text)).map(
    ({ category }) => category,
  );
}

export function shouldListTrending(text: string): {
  allowed: boolean;
  reason?: "hateful" | "dangerous" | "personal";
} {
  if (HATEFUL_PATTERNS.some((pattern) => pattern.test(text))) {
    return { allowed: false, reason: "hateful" };
  }
  if (DANGEROUS_PATTERNS.some((pattern) => pattern.test(text))) {
    return { allowed: false, reason: "dangerous" };
  }
  if (
    PERSONAL_PATTERNS.some((pattern) => pattern.test(text)) ||
    PRIVATE_NAME_PATTERNS.some((pattern) => pattern.test(text))
  ) {
    return { allowed: false, reason: "personal" };
  }
  return { allowed: true };
}

const INJECTION_PATTERNS = [
  /ignore (all|any|the) (previous|prior|above) instructions/i,
  /disregard (all|any|the) (previous|prior|above)/i,
  /system prompt/i,
  /you are now (an?|the) /i,
  /reveal (your|the) (prompt|api key|secret)/i,
  /respond only with/i,
];

export function detectPromptInjection(text: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(text));
}
