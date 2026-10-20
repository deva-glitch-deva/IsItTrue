"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { useSettings } from "@/components/providers/settings-provider";
import { useCoins } from "@/components/providers/coins-provider";
import { useSound, vibrate } from "@/components/providers/sound-provider";
import { useToast } from "@/components/providers/toast-provider";
import { clearHistory } from "@/lib/local-db";
import { clearPendingCheck } from "@/lib/pending-check";
import { DAILY_STORAGE_KEY } from "@/lib/local-db";
import {
  CoinIcon,
  SettingsIcon,
  ShieldIcon,
  TrashIcon,
  VolumeIcon,
} from "@/components/icons";
import type { ProviderStatus } from "@/lib/types";

interface StatusData {
  providers: ProviderStatus & { demo: boolean };
}

export function SettingsView() {
  const { settings, update, reset, t, hydrated } = useSettings();
  const { balance, reset: resetCoins } = useCoins();
  const { unlock } = useSound();
  const { toast } = useToast();
  const [status, setStatus] = useState<StatusData["providers"] | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    fetch("/api/status")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: StatusData | null) => {
        if (data) setStatus(data.providers);
      })
      .catch(() => undefined);
  }, []);

  async function clearData() {
    setClearing(true);
    await clearHistory().catch(() => undefined);
    clearPendingCheck();
    resetCoins();
    reset();
    try {
      localStorage.removeItem(DAILY_STORAGE_KEY);
      for (let index = localStorage.length - 1; index >= 0; index -= 1) {
        const key = localStorage.key(index);
        if (key?.startsWith("iit-rewarded:")) localStorage.removeItem(key);
      }
      sessionStorage.removeItem("iit-last-result");
    } catch {
      // Ignore storage failures.
    }
    setClearing(false);
    setConfirmClear(false);
    toast(t("settings.resetDone"), "success");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="sticker -rotate-2 bg-sky/40">
            <SettingsIcon className="h-4 w-4" />
            {t("settings.title")}
          </span>
          <h1 className="section-title mt-3">{t("settings.title")}</h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
            {t("settings.subtitle")}
          </p>
        </div>
        <span className="chip rotate-1">{t("settings.autoSaved")}</span>
      </div>

      <section className="clay-card mt-6 p-5 sm:p-6">
        <h2 className="font-display text-xl font-black">
          {t("settings.appearance")}
        </h2>
        <div className="mt-4 space-y-4">
          <Segmented
            label={t("settings.theme")}
            options={[
              { value: "dark", label: t("settings.dark") },
              { value: "light", label: t("settings.light") },
            ]}
            value={settings.theme}
            onChange={(value) => update("theme", value as "dark" | "light")}
          />
          <Segmented
            label={t("settings.language")}
            options={[
              { value: "en", label: "English" },
              { value: "hinglish", label: "Hinglish" },
            ]}
            value={settings.language}
            onChange={(value) =>
              update("language", value as "en" | "hinglish")
            }
          />
          <div>
            <Segmented
              label={t("settings.skin")}
              options={[
                { value: "cap", label: t("settings.capSkin") },
                { value: "official", label: t("settings.officialSkin") },
              ]}
              value={settings.skin}
              onChange={(value) => update("skin", value as "cap" | "official")}
            />
            <p className="mt-2 text-[10px] leading-relaxed text-muted">
              {t("settings.skinHint")}
            </p>
          </div>
        </div>
      </section>

      <section className="clay-card mt-4 p-5 sm:p-6">
        <h2 className="flex items-center gap-2 font-display text-xl font-black">
          <VolumeIcon className="h-5 w-5" />
          {t("settings.sound")}
        </h2>
        <div className="mt-3 divide-y divide-line/10">
          <ToggleRow
            title={t("settings.sound")}
            hint={t("settings.soundHint")}
            checked={settings.sound}
            onChange={(value) => {
              unlock();
              update("sound", value);
              if (value) window.setTimeout(() => vibrate(20), 60);
            }}
          />
          <ToggleRow
            title={t("settings.haptics")}
            hint={t("settings.hapticsHint")}
            checked={settings.haptics}
            onChange={(value) => {
              update("haptics", value);
              if (value) vibrate([20, 30, 20]);
            }}
          />
          <ToggleRow
            title={t("settings.reduced")}
            hint={t("settings.reducedHint")}
            checked={settings.reducedMotion}
            onChange={(value) => update("reducedMotion", value)}
          />
        </div>
      </section>

      <section className="clay-card mt-4 border-unverified/30 p-5 sm:p-6">
        <h2 className="flex items-center gap-2 font-display text-xl font-black">
          <ShieldIcon className="h-5 w-5" />
          {t("settings.serious")}
        </h2>
        <div className="mt-3">
          <ToggleRow
            title={t("settings.serious")}
            hint={t("settings.seriousHint")}
            checked={settings.seriousMode}
            onChange={(value) => {
              update("seriousMode", value);
              if (value) toast(t("serious.banner"));
            }}
          />
        </div>
      </section>

      <section className="clay-card mt-4 p-5 sm:p-6">
        <h2 className="font-display text-xl font-black">{t("settings.demo")}</h2>
        <div className="mt-3">
          <ToggleRow
            title={t("settings.demo")}
            hint={t("settings.demoHint")}
            checked={settings.demoMode}
            onChange={(value) => {
              update("demoMode", value);
              if (value) {
                void import("@/lib/local-db").then((mod) =>
                  mod.seedDemoHistory().catch(() => undefined),
                );
              }
            }}
          />
        </div>
      </section>

      <section className="clay-card mt-4 p-5 sm:p-6">
        <h2 className="flex items-center gap-2 font-display text-xl font-black">
          <CoinIcon className="h-5 w-5 text-misleading" />
          {t("coins.title")}
        </h2>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-line/10 bg-paper/50 p-4">
          <div>
            <p className="font-display text-4xl font-black leading-none">
              {balance}
            </p>
            <p className="mt-1 text-[10px] font-extrabold uppercase tracking-wider text-muted">
              {t("common.playCoins")}
            </p>
          </div>
          <p className="max-w-xs text-[10px] leading-relaxed text-muted">
            {t("coins.rules")}
          </p>
        </div>
      </section>

      <section className="clay-card mt-4 p-5 sm:p-6">
        <h2 className="font-display text-xl font-black">
          {t("settings.providers")}
        </h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {[
            { key: "ai", label: "AI analysis" },
            { key: "stt", label: "Speech to text" },
            { key: "search", label: "Web search" },
            { key: "cache", label: "Shared cache" },
          ].map((row) => {
            const value = status?.[row.key as keyof StatusData["providers"]];
            const live = value === "live" || value === "postgres";
            return (
              <div
                key={row.key}
                className="flex items-center justify-between rounded-xl border border-line/10 bg-paper/45 px-3 py-2"
              >
                <span className="text-xs font-bold">{row.label}</span>
                <span className="inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider text-muted">
                  <span
                    className={clsx(
                      "h-2 w-2 rounded-full",
                      !value
                        ? "bg-line/30"
                        : live
                          ? "bg-true"
                          : "bg-misleading",
                    )}
                  />
                  {!value
                    ? t("settings.unavailable")
                    : value === "live"
                      ? t("settings.providerLive")
                      : value === "postgres"
                        ? t("settings.providerPostgres")
                        : value === "memory"
                          ? t("settings.providerMemory")
                          : t("settings.providerMock")}
                </span>
              </div>
            );
          })}
        </div>
        {status?.demo && (
          <p className="mt-3 rounded-xl border border-misleading/30 bg-misleading/10 px-3 py-2 text-[10px] leading-relaxed text-misleading-deep dark:text-butter">
            Demo mode active. Add server-side keys in .env to go live. The whole
            app still works.
          </p>
        )}
      </section>

      <section className="clay-card mt-4 p-5 sm:p-6">
        <h2 className="font-display text-xl font-black">{t("settings.data")}</h2>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          {t("settings.clearDataHint")}
        </p>
        {!confirmClear ? (
          <button
            type="button"
            onClick={() => setConfirmClear(true)}
            className="btn-secondary mt-4 !text-false-deep dark:!text-candy"
          >
            <TrashIcon className="h-4 w-4" />
            {t("settings.clearData")}
          </button>
        ) : (
          <div className="mt-4 rounded-xl border-2 border-false/40 bg-false/10 p-4">
            <p className="text-sm font-bold text-false-deep dark:text-candy">
              {t("settings.clearConfirm")}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={clearData}
                disabled={clearing}
                className="rounded-xl border-2 border-false bg-false px-4 py-2 text-[10px] font-extrabold uppercase tracking-wider text-white disabled:opacity-60"
              >
                {clearing ? t("common.loading") : t("common.confirm")}
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
      </section>

      <section className="mt-4 rounded-2xl border-2 border-dashed border-line/20 bg-paper/45 p-5">
        <h2 className="flex items-center gap-2 font-display text-lg font-black">
          <ShieldIcon className="h-4 w-4" />
          {t("settings.privacy")}
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          {t("settings.privacyText")}
        </p>
      </section>

      <p className="mt-5 text-center text-[9px] font-bold uppercase tracking-widest text-muted">
        {hydrated ? t("footer.disclaimer") : t("common.loading")}
      </p>
    </div>
  );
}

function Segmented({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="label">{label}</p>
      <div className="inline-flex w-full rounded-xl border border-line/15 bg-paper p-1 sm:w-auto">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
            className={clsx(
              "flex-1 rounded-lg px-4 py-2 text-[10px] font-extrabold uppercase tracking-wider transition-colors sm:flex-none",
              value === option.value
                ? "bg-ink text-paper"
                : "text-muted hover:text-ink",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToggleRow({
  title,
  hint,
  checked,
  onChange,
}: {
  title: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <p className="text-sm font-extrabold">{title}</p>
        <p className="mt-0.5 max-w-sm text-[10px] leading-relaxed text-muted">
          {hint}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onChange(!checked)}
        className={clsx(
          "relative h-8 w-14 shrink-0 rounded-full border-2 transition-colors",
          checked
            ? "border-true-deep bg-true"
            : "border-line/25 bg-clay",
        )}
      >
        <span
          className={clsx(
            "absolute top-0.5 h-6 w-6 rounded-full border-2 border-line/20 bg-cream shadow transition-all",
            checked ? "left-[26px]" : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}
