"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useSettings } from "@/components/providers/settings-provider";
import { useSound, vibrate } from "@/components/providers/sound-provider";
import { SeriousBanner } from "@/components/ui/serious-banner";
import {
  ArrowRightIcon,
  LinkIcon,
  SearchIcon,
  UploadIcon,
  XIcon,
} from "@/components/icons";
import { classifySensitive } from "@/lib/safety";
import { MAX_FILE_BYTES } from "@/lib/constants";
import {
  setPendingCheck,
  type VerifyMode,
} from "@/lib/pending-check";

const TABS: Array<{
  id: VerifyMode;
  icon: typeof SearchIcon;
  labelKey: "verify.tab.text" | "verify.tab.reel" | "verify.tab.media";
}> = [
  { id: "text", icon: SearchIcon, labelKey: "verify.tab.text" },
  { id: "reel", icon: LinkIcon, labelKey: "verify.tab.reel" },
  { id: "media", icon: UploadIcon, labelKey: "verify.tab.media" },
];

const SAMPLES = [
  { key: "verify.sampleEiffel" as const, text: "The Eiffel Tower was originally intended to be a temporary structure." },
  { key: "verify.sampleLemon" as const, text: "Drinking hot lemon water cures cancer." },
  { key: "verify.sampleNasa" as const, text: "NASA confirmed that Earth will experience 15 days of complete darkness in December." },
];

function isInstagramReel(value: string): boolean {
  try {
    const url = new URL(value);
    if (!["instagram.com", "www.instagram.com"].includes(url.hostname)) {
      return false;
    }
    return /^\/(reel|reels|p|tv)\//.test(url.pathname);
  } catch {
    return false;
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function VerifyForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { t, settings, update, hydrated } = useSettings();
  const { unlock, play } = useSound();
  const [mode, setMode] = useState<VerifyMode>("text");
  const [claim, setClaim] = useState("");
  const [reelUrl, setReelUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [reelStatus, setReelStatus] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const initialized = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const reelTimer = useRef<number | null>(null);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const modeParam = params.get("mode");
    if (modeParam === "reel" || modeParam === "media" || modeParam === "text") {
      setMode(modeParam);
    }
    const claimParam = params.get("claim");
    if (claimParam) {
      setMode("text");
      setClaim(claimParam.slice(0, 1800));
      return;
    }

    const sharedText = params.get("text") ?? "";
    const sharedUrl = params.get("url") ?? "";
    const urlInText = sharedText.match(/https?:\/\/\S+/)?.[0];
    const sharedLink = sharedUrl || urlInText || "";

    if (sharedLink && isInstagramReel(sharedLink)) {
      setMode("reel");
      setReelUrl(sharedLink);
      const leftover = sharedText.replace(sharedLink, "").trim();
      const title = params.get("title")?.trim() ?? "";
      const nextCaption = [leftover, title].filter(Boolean).join("\n");
      if (nextCaption) setCaption(nextCaption.slice(0, 1800));
    } else if (sharedText.trim()) {
      setMode("text");
      setClaim(sharedText.trim().slice(0, 1800));
    }
  }, [params]);

  useEffect(() => {
    if (mode !== "reel" || !isInstagramReel(reelUrl.trim()) || caption.trim().length >= 8) {
      return;
    }
    if (reelTimer.current) window.clearTimeout(reelTimer.current);
    reelTimer.current = window.setTimeout(() => {
      setReelStatus(t("verify.fetchingReel"));
      fetch(`/api/reel?url=${encodeURIComponent(reelUrl.trim())}`)
        .then((response) => response.json())
        .then((data: { fetched?: boolean; caption?: string; title?: string; warning?: string }) => {
          if (data.fetched && (data.caption || data.title)) {
            setCaption((current) => current || (data.caption || data.title || "").slice(0, 1800));
            setReelStatus(t("verify.reelFetched"));
          } else {
            setReelStatus(data.warning || t("verify.reelMissing"));
          }
        })
        .catch(() => setReelStatus(t("verify.reelMissing")));
    }, 500);
    return () => {
      if (reelTimer.current) window.clearTimeout(reelTimer.current);
    };
  }, [mode, reelUrl, caption, t]);

  const seriousPreview = classifySensitive(
    mode === "text" ? claim : mode === "reel" ? caption : "",
  );

  function chooseFile(next: File | null) {
    setError("");
    if (!next) {
      setFile(null);
      return;
    }
    if (next.size > MAX_FILE_BYTES) {
      setError(t("verify.error.file"));
      return;
    }
    if (!next.type.startsWith("video/") && !next.type.startsWith("audio/")) {
      setError(t("verify.error.file"));
      return;
    }
    setFile(next);
    setUploadProgress(100);
    vibrate(20);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    unlock();

    if (mode === "text" && claim.trim().length < 8) {
      setError(t("verify.error.short"));
      return;
    }
    if (mode === "reel" && !isInstagramReel(reelUrl.trim())) {
      setError(t("verify.error.url"));
      return;
    }
    if (mode === "media" && !file) {
      setError(t("verify.error.file"));
      return;
    }

    play("whoosh");
    vibrate([12, 30, 18]);

    setPendingCheck({
      mode,
      language: settings.language,
      claim: claim.trim(),
      reelUrl: reelUrl.trim(),
      caption: caption.trim(),
      file: file ?? undefined,
      createdAt: Date.now(),
    });
    router.push("/analysis");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="relative">
        <span className="sticker -rotate-2 bg-butter">Case intake</span>
        <h1 className="section-title mt-3 max-w-lg">{t("verify.title")}</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
          {t("verify.subtitle")}
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Input type"
        className="mt-7 grid grid-cols-3 gap-2 rounded-[1.4rem] border-2 border-line/15 bg-clay/60 p-1.5"
      >
        {TABS.map(({ id, icon: Icon, labelKey }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`tab-${id}`}
            aria-selected={mode === id}
            aria-controls={`panel-${id}`}
            onClick={() => {
              setMode(id);
              setError("");
            }}
            className={clsx(
              "flex min-h-12 items-center justify-center gap-2 rounded-xl px-2 text-[10px] font-extrabold uppercase tracking-[0.08em] transition-all sm:text-xs",
              mode === id
                ? "border border-line/20 bg-cream text-ink shadow-sm"
                : "text-muted hover:text-ink",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">{t(labelKey)}</span>
            <span className="sm:hidden">
              {id === "text" ? "Text" : id === "reel" ? "Reel" : "File"}
            </span>
          </button>
        ))}
      </div>

      <form
        onSubmit={submit}
        className="clay-card mt-4 p-5 sm:p-7"
        noValidate
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={mode}
            id={`panel-${mode}`}
            role="tabpanel"
            aria-labelledby={`tab-${mode}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {mode === "text" && (
              <div>
                <label htmlFor="claim" className="label">
                  {t("verify.claimLabel")}
                </label>
                <textarea
                  id="claim"
                  value={claim}
                  onChange={(event) => {
                    setClaim(event.target.value.slice(0, 1800));
                    setError("");
                  }}
                  placeholder={t("verify.claimPlaceholder")}
                  rows={5}
                  maxLength={1800}
                  className="field resize-y text-base"
                  aria-describedby="claim-count"
                />
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                    {t("home.inputHint")}
                  </p>
                  <span
                    id="claim-count"
                    className="text-[10px] font-bold tabular-nums text-muted"
                  >
                    {claim.length}/1800
                  </span>
                </div>
              </div>
            )}

            {mode === "reel" && (
              <div className="space-y-5">
                <div>
                  <label htmlFor="reel-url" className="label">
                    {t("verify.reelLabel")}
                  </label>
                  <div className="relative">
                    <LinkIcon className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-muted" />
                    <input
                      id="reel-url"
                      type="url"
                      inputMode="url"
                      value={reelUrl}
                      onChange={(event) => {
                        setReelUrl(event.target.value.slice(0, 500));
                        setError("");
                      }}
                      placeholder={t("verify.reelPlaceholder")}
                      className="field pl-12"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="caption" className="label">
                    {t("verify.captionLabel")}{" "}
                    <span className="normal-case tracking-normal opacity-60">
                      ({t("common.optional")})
                    </span>
                  </label>
                  <textarea
                    id="caption"
                    value={caption}
                    onChange={(event) =>
                      setCaption(event.target.value.slice(0, 1800))
                    }
                    placeholder={t("verify.captionPlaceholder")}
                    rows={4}
                    maxLength={1800}
                    className="field resize-y"
                  />
                  <p className="mt-2 text-xs leading-relaxed text-muted">
                    {t("verify.captionHint")}
                  </p>
                  {reelStatus && (
                    <p className="mt-2 rounded-xl border border-line/15 bg-paper/60 px-3 py-2 text-[11px] font-semibold text-muted">
                      {reelStatus}
                    </p>
                  )}
                </div>
              </div>
            )}

            {mode === "media" && (
              <div>
                <p className="label">{t("verify.mediaLabel")}</p>
                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragging(false);
                    chooseFile(event.dataTransfer.files?.[0] ?? null);
                  }}
                  className={clsx(
                    "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-10 text-center transition-colors",
                    dragging
                      ? "border-hot bg-hot/10"
                      : "border-line/25 bg-paper/50",
                  )}
                >
                  <div className="mb-3 flex h-14 w-14 -rotate-3 items-center justify-center rounded-2xl border-2 border-line/20 bg-sky/50 shadow-sticker">
                    <UploadIcon className="h-7 w-7" />
                  </div>
                  {file ? (
                    <>
                      <p className="max-w-full break-all font-display text-lg font-extrabold">
                        {file.name}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {formatBytes(file.size)} · {file.type || "media"}
                      </p>
                      <div className="mt-3 h-2 w-48 overflow-hidden rounded-full bg-clay">
                        <div
                          className="h-full rounded-full bg-true"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="mt-1 text-[10px] font-extrabold uppercase tracking-wider text-muted">
                        {t("verify.uploadProgress", { n: uploadProgress })}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setFile(null);
                          if (fileInput.current) fileInput.current.value = "";
                        }}
                        className="btn-secondary mt-4 !min-h-9 !px-3 !py-1.5 !text-[10px]"
                      >
                        <XIcon className="h-3.5 w-3.5" />
                        {t("verify.removeFile")}
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="font-display text-lg font-extrabold">
                        {t("verify.drop")}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {t("verify.dropSub")}
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInput.current?.click()}
                        className="btn-secondary mt-4"
                      >
                        {t("verify.choose")}
                      </button>
                    </>
                  )}
                  <input
                    ref={fileInput}
                    type="file"
                    accept="video/*,audio/*"
                    className="sr-only"
                    aria-label={t("verify.choose")}
                    onChange={(event) =>
                      chooseFile(event.target.files?.[0] ?? null)
                    }
                  />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  {t("verify.mediaHint")}
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {mode === "text" && (
          <div className="mt-5">
            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-muted">
              {t("verify.sample")}
            </p>
            <div className="flex flex-wrap gap-2">
              {SAMPLES.map((sample) => (
                <button
                  key={sample.key}
                  type="button"
                  onClick={() => {
                    setClaim(sample.text);
                    setError("");
                  }}
                  className="rounded-full border border-line/15 bg-paper px-3 py-1.5 text-left text-[10px] font-bold text-muted transition-colors hover:border-hot/50 hover:text-ink"
                >
                  {t(sample.key)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-4 border-t border-line/10 pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="label !mb-1.5">{t("common.language")}</p>
              <div className="inline-flex rounded-full border border-line/15 bg-paper p-1">
                {(["en", "hinglish"] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => update("language", lang)}
                    aria-pressed={settings.language === lang}
                    className={clsx(
                      "rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider transition-colors",
                      settings.language === lang
                        ? "bg-ink text-paper"
                        : "text-muted",
                    )}
                  >
                    {lang === "en" ? "English" : "Hinglish"}
                  </button>
                ))}
              </div>
            </div>
            <p className="max-w-xs text-[10px] leading-relaxed text-muted">
              {t("verify.languageHint")}
            </p>
          </div>

          {seriousPreview.serious && <SeriousBanner topic />}

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-false/40 bg-false/10 px-4 py-3 text-sm font-bold text-false-deep dark:text-candy"
            >
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary w-full !min-h-14">
            {t("verify.submit")}
            <ArrowRightIcon className="h-5 w-5" />
          </button>
          <p className="text-center text-[10px] leading-relaxed text-muted">
            {t("verify.privacy")}
          </p>
        </div>
      </form>

      {!hydrated && <span className="sr-only">Loading settings</span>}
      {settings.seriousMode && (
        <div className="mt-4">
          <SeriousBanner />
        </div>
      )}
    </div>
  );
}
