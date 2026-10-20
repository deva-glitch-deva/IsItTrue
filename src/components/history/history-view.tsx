"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { useSettings } from "@/components/providers/settings-provider";
import { useToast } from "@/components/providers/toast-provider";
import { VerdictLabel } from "@/components/ui/verdict-label";
import { EmptyState } from "@/components/ui/empty-state";
import {
  clearHistory,
  deleteHistoryItem,
  exportHistory,
  listHistory,
} from "@/lib/local-db";
import { downloadBlob } from "@/lib/share-card";
import type { HistoryItem } from "@/lib/types";
import {
  ArrowRightIcon,
  DownloadIcon,
  SearchIcon,
  TrashIcon,
} from "@/components/icons";

export function HistoryView() {
  const { t, settings } = useSettings();
  const { toast } = useToast();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      setItems(await listHistory());
    } catch {
      setError(t("errors.database"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter(
      (item) =>
        item.claim.toLowerCase().includes(needle) ||
        item.verdict.toLowerCase().includes(needle),
    );
  }, [items, query]);

  async function remove(id: string) {
    await deleteHistoryItem(id).catch(() => undefined);
    setItems((current) => current.filter((item) => item.id !== id));
    toast(t("history.deleted"), "success");
  }

  async function clearAll() {
    await clearHistory().catch(() => undefined);
    setItems([]);
    setConfirmClear(false);
    toast(t("settings.resetDone"), "success");
  }

  function exportAll() {
    if (items.length === 0) return;
    const json = exportHistory(items);
    const blob = new Blob([json], { type: "application/json" });
    downloadBlob(blob, `is-it-true-history-${new Date().toISOString().slice(0, 10)}.json`);
    toast(t("history.exported"), "success");
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="sticker -rotate-2 bg-mint/40 text-true-deep dark:text-mint">
            On this device
          </span>
          <h1 className="section-title mt-3">{t("history.title")}</h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
            {t("history.subtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={exportAll}
            disabled={items.length === 0}
            className="btn-secondary !min-h-10 !px-3 !py-2 !text-[10px] disabled:opacity-40"
          >
            <DownloadIcon className="h-4 w-4" />
            {t("history.export")}
          </button>
          <button
            type="button"
            onClick={() => setConfirmClear(true)}
            disabled={items.length === 0}
            className="btn-secondary !min-h-10 !px-3 !py-2 !text-[10px] !text-false-deep disabled:opacity-40 dark:!text-candy"
          >
            <TrashIcon className="h-4 w-4" />
            {t("history.clear")}
          </button>
        </div>
      </div>

      <div className="relative mt-6">
        <SearchIcon className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-muted" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("history.search")}
          className="field pl-12"
          aria-label={t("history.search")}
        />
      </div>

      <p className="mt-3 text-[10px] font-extrabold uppercase tracking-widest text-muted">
        {t("history.items", { count: items.length })}
      </p>

      {confirmClear && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="clear-title"
          className="mt-4 rounded-2xl border-2 border-false/40 bg-false/10 p-4"
        >
          <p id="clear-title" className="text-sm font-extrabold text-false-deep dark:text-candy">
            {t("history.clearConfirm")}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={clearAll}
              className="rounded-xl border-2 border-false bg-false px-4 py-2 text-[10px] font-extrabold uppercase tracking-wider text-white"
            >
              {t("history.clear")}
            </button>
            <button
              type="button"
              onClick={() => setConfirmClear(false)}
              className="btn-secondary !min-h-9 !px-3 !py-1.5 !text-[10px]"
            >
              {t("common.cancel")}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-2xl bg-clay/60"
            />
          ))}
        </div>
      ) : error ? (
        <div className="mt-6 rounded-2xl border border-false/30 bg-false/10 p-4 text-sm font-semibold text-false-deep dark:text-candy">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={t("history.empty")}
            action={t("home.cta")}
            href="/verify"
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState title={t("history.noResults")} />
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {filtered.map((item, index) => {
            const serious = settings.seriousMode;
            return (
              <div
                key={item.id}
                className={clsx(
                  "group flex flex-col gap-3 rounded-2xl border-2 border-line/15 bg-cream p-4 shadow-clay-sm sm:flex-row sm:items-center",
                  index % 2 === 0 ? "rotate-[0.15deg]" : "-rotate-[0.15deg]",
                )}
              >
                <div className="flex items-center gap-3 sm:w-40 sm:shrink-0">
                  <VerdictLabel
                    verdict={item.verdict}
                    useSkin={settings.skin === "cap"}
                    serious={serious}
                    size="sm"
                  />
                  <span className="text-xs font-extrabold tabular-nums text-muted">
                    {item.confidence}%
                  </span>
                </div>
                <Link
                  href={`/results/${item.id}`}
                  className="min-w-0 flex-1"
                >
                  <p className="line-clamp-2 font-display text-base font-extrabold leading-snug transition-colors group-hover:text-hot">
                    {item.claim}
                  </p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-muted">
                    {new Date(item.checkedAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}{" "}
                    · {item.language === "en" ? "English" : "Hinglish"}
                  </p>
                </Link>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/results/${item.id}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line/15 bg-paper text-muted hover:text-ink"
                    aria-label={t("common.view")}
                  >
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line/15 bg-paper text-muted hover:text-false"
                    aria-label={t("common.delete")}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
