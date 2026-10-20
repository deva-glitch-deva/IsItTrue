"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { useSettings } from "@/components/providers/settings-provider";
import { useToast } from "@/components/providers/toast-provider";
import {
  copyToClipboard,
  downloadBlob,
  familyReply,
  generateStoryCard,
  shareCard,
  shareText,
} from "@/lib/share-card";
import type { AnalysisResult } from "@/lib/types";
import {
  DownloadIcon,
  ExternalIcon,
  LinkIcon,
  ShareIcon,
  XIcon,
} from "@/components/icons";

type Mode = "menu" | "family";

export function ShareSheet({
  result,
  open,
  onClose,
}: {
  result: AnalysisResult;
  open: boolean;
  onClose: () => void;
}) {
  const { t, settings } = useSettings();
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>("menu");
  const [busy, setBusy] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const serious = result.serious || settings.seriousMode;
  const siteUrl =
    typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    if (!open) return;
    setMode("menu");
    const timeout = window.setTimeout(() => closeRef.current?.focus(), 80);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  async function getBlob() {
    return generateStoryCard(result, {
      language: settings.language,
      useSkin: settings.skin === "cap",
      serious,
    });
  }

  async function story() {
    setBusy("story");
    try {
      const blob = await getBlob();
      const outcome = await shareCard(
        blob,
        shareText(result, settings.language, siteUrl),
      );
      toast(
        outcome === "downloaded"
          ? t("share.downloaded")
          : t("common.done"),
        "success",
      );
      onClose();
    } catch {
      toast(t("share.failed"), "error");
    } finally {
      setBusy(null);
    }
  }

  async function whatsapp() {
    setBusy("whatsapp");
    try {
      const text = shareText(result, settings.language, siteUrl);
      const nav = navigator as Navigator & {
        canShare?: (data?: ShareData) => boolean;
      };
      if (nav.share && nav.canShare) {
        const blob = await getBlob();
        const file = new File([blob], "is-it-true.png", {
          type: "image/png",
        });
        if (nav.canShare({ files: [file] })) {
          await nav.share({
            files: [file],
            title: "Is It True?",
            text,
          });
          onClose();
          return;
        }
      }
      await copyToClipboard(text);
      window.open(
        `https://wa.me/?text=${encodeURIComponent(text)}`,
        "_blank",
        "noopener,noreferrer",
      );
      toast(t("share.linkCopied"), "success");
      onClose();
    } catch {
      toast(t("share.failed"), "error");
    } finally {
      setBusy(null);
    }
  }

  async function copyReply() {
    const ok = await copyToClipboard(familyReply(result, siteUrl));
    toast(ok ? t("common.copied") : t("share.failed"), ok ? "success" : "error");
  }

  async function copyLink() {
    const ok = await copyToClipboard(
      `${siteUrl}/results/${result.id}`,
    );
    toast(ok ? t("share.linkCopied") : t("share.failed"), ok ? "success" : "error");
  }

  async function downloadOnly() {
    try {
      const blob = await getBlob();
      downloadBlob(blob, "is-it-true-story.png");
      toast(t("share.downloaded"), "success");
    } catch {
      toast(t("share.failed"), "error");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/55 p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-title"
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="max-h-[92svh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] border-2 border-line/20 bg-cream p-5 shadow-clay sm:rounded-[2rem] sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">{t("common.share")}</p>
                <h2 id="share-title" className="mt-1 font-display text-3xl font-black">
                  {mode === "family" ? t("share.family") : t("share.title")}
                </h2>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line/20 bg-paper"
                aria-label={t("common.close")}
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            {mode === "menu" ? (
              <div className="mt-5 space-y-2.5">
                <ShareOption
                  title={t("share.story")}
                  sub={t("share.storySub")}
                  color="bg-hot/15"
                  icon={<ShareIcon className="h-5 w-5" />}
                  busy={busy === "story"}
                  onClick={story}
                />
                <ShareOption
                  title={t("share.whatsapp")}
                  sub={t("share.whatsappSub")}
                  color="bg-mint/30"
                  icon={<ExternalIcon className="h-5 w-5" />}
                  busy={busy === "whatsapp"}
                  onClick={whatsapp}
                />
                {!serious && (
                  <ShareOption
                    title={t("share.family")}
                    sub={t("share.familySub")}
                    color="bg-butter/50"
                    icon={<LinkIcon className="h-5 w-5" />}
                    onClick={() => setMode("family")}
                  />
                )}

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={downloadOnly}
                    className="btn-secondary !min-h-10 !px-3 !py-2 !text-[10px]"
                  >
                    <DownloadIcon className="h-4 w-4" />
                    PNG
                  </button>
                  <button
                    type="button"
                    onClick={copyLink}
                    className="btn-secondary !min-h-10 !px-3 !py-2 !text-[10px]"
                  >
                    <LinkIcon className="h-4 w-4" />
                    {t("share.copyLink")}
                  </button>
                </div>
                <p className="pt-1 text-center text-[9px] leading-relaxed text-muted">
                  {t("share.cardFooter")}
                </p>
              </div>
            ) : (
              <div className="mt-5">
                <div className="relative overflow-hidden rounded-2xl border-2 border-line/20 bg-[#e7f7ee] p-4">
                  <span className="sticker rotate-2 bg-white/70 text-true-deep">
                    {t("share.familyTag")}
                  </span>
                  <p className="mt-3 font-display text-xl font-black leading-tight text-[#0a3d27]">
                    {t("share.familyReply")}
                  </p>
                  <pre className="mt-3 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-xl border border-[#0a3d27]/15 bg-white/55 p-3 font-body text-[11px] leading-relaxed text-[#173c2b]">
                    {familyReply(result, siteUrl)}
                  </pre>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={copyReply}
                    className="btn-primary flex-1 !min-h-11 !text-[11px]"
                  >
                    {t("share.familyCopy")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("menu")}
                    className="btn-secondary !min-h-11"
                  >
                    {t("common.back")}
                  </button>
                </div>
                <p className="mt-2 text-center text-[9px] text-muted">
                  {t("share.cardFooter")}
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ShareOption({
  title,
  sub,
  icon,
  color,
  onClick,
  busy,
}: {
  title: string;
  sub: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
  busy?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={clsx(
        "flex w-full items-center gap-3 rounded-2xl border-2 border-line/15 px-4 py-3 text-left transition-transform hover:-translate-y-0.5 disabled:opacity-60",
        color,
      )}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line/15 bg-cream/70">
        {busy ? <span className="animate-blink">…</span> : icon}
      </span>
      <span>
        <span className="block font-display text-lg font-extrabold leading-tight">
          {title}
        </span>
        <span className="mt-0.5 block text-[10px] leading-snug text-muted">
          {sub}
        </span>
      </span>
    </button>
  );
}
