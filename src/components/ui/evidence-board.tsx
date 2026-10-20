"use client";

import clsx from "clsx";
import type { Source } from "@/lib/types";
import { SOURCE_KIND_LABEL } from "@/lib/constants";
import { classifySourceKind } from "@/lib/sources";
import { useSettings } from "@/components/providers/settings-provider";
import { ExternalIcon, LinkIcon } from "@/components/icons";

const PIN_COLORS = ["#ef4444", "#f5a623", "#1fae6a", "#83c7ff"];

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function SourceCard({
  source,
  index,
}: {
  source: Source;
  index: number;
}) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx(
        "paper-sheet group relative block rounded-xl border-2 border-line/20 bg-cream p-4 pl-6 shadow-sticker transition-transform duration-200",
        index % 2 === 0 ? "rotate-[0.5deg]" : "-rotate-[0.6deg]",
        "hover:z-10 hover:-translate-y-1 hover:rotate-0",
      )}
    >
      <span
        aria-hidden="true"
        className="absolute -left-2.5 top-5 h-5 w-5 rounded-full border-2 border-white/40 shadow"
        style={{ background: PIN_COLORS[index % PIN_COLORS.length] }}
      />
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-muted">
            {source.publisher}
            <span className="ml-2 rounded bg-sky/20 px-1.5 py-0.5 text-ink">
              {SOURCE_KIND_LABEL[source.kind ?? classifySourceKind(source.url)]}
            </span>
            {source.credibility === "high" && (
              <span className="ml-2 rounded bg-true/15 px-1.5 py-0.5 text-true-deep dark:text-mint">
                high trust
              </span>
            )}
          </p>
          <h4 className="mt-1 font-display text-base font-extrabold leading-tight text-ink">
            {source.title}
          </h4>
        </div>
        <ExternalIcon className="mt-1 h-4 w-4 shrink-0 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>
      <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted">
        {source.snippet}
      </p>
      <p className="mt-2 flex items-center gap-1 truncate text-[10px] font-bold text-muted/80">
        <LinkIcon className="h-3 w-3 shrink-0" />
        {hostname(source.url)}
      </p>
    </a>
  );
}

export function EvidenceBoard({
  sources,
  title,
  emptyText,
}: {
  sources: Source[];
  title?: string;
  emptyText?: string;
}) {
  const { t } = useSettings();
  if (sources.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-line/25 p-6 text-center text-sm text-muted">
        {emptyText ?? t("claim.noSources")}
      </div>
    );
  }
  return (
    <div className="relative">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted">
          {title ?? t("results.evidence")}
        </p>
        <span className="chip rotate-1">
          {sources.length} {t("claim.sourceCount")}
        </span>
      </div>
      <div className="relative grid gap-4 sm:grid-cols-2">
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden h-full w-full sm:block"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <path
            d="M12 8 C 60 18, 40 40, 86 46 S 32 72, 70 92"
            fill="none"
            stroke="#d94a4a"
            strokeWidth="0.45"
            strokeDasharray="1.2 1.2"
            opacity="0.55"
          />
          <path
            d="M84 20 C 30 28, 62 60, 18 70"
            fill="none"
            stroke="#d94a4a"
            strokeWidth="0.35"
            opacity="0.32"
          />
        </svg>
        {sources.map((source, index) => (
          <SourceCard key={source.id} source={source} index={index} />
        ))}
      </div>
    </div>
  );
}
