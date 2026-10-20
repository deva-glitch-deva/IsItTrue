"use client";

import { useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { VERDICT_META } from "@/lib/constants";
import { useSettings } from "@/components/providers/settings-provider";
import { useSound, vibrate } from "@/components/providers/sound-provider";
import type { Verdict } from "@/lib/types";

export function VerdictStampFallback({
  verdict,
  useSkin,
  serious,
}: {
  verdict: Verdict;
  useSkin: boolean;
  serious: boolean;
}) {
  const { settings } = useSettings();
  const { play } = useSound();
  const press = useAnimation();
  const ink = useAnimation();
  const wax = useAnimation();
  const played = useRef(false);
  const meta = VERDICT_META[verdict];
  const skinActive = useSkin && !serious;
  const label = skinActive ? meta.skin : meta.official;

  useEffect(() => {
    if (played.current) return;
    played.current = true;
    const reduced = settings.reducedMotion;

    if (reduced) {
      void press.start({ opacity: 1, rotateX: 0, y: 0, scale: 1 });
      void ink.start({ opacity: 0.55, scale: 1 });
      void wax.start({ opacity: 1, scale: 1 });
      return;
    }

    void press.start({
      opacity: [0, 1, 1, 1],
      y: [-28, -8, 10, 0],
      rotateX: [58, 22, -6, 8],
      rotateZ: [-12, -8, -7, -8],
      scale: [0.86, 0.96, 1.04, 1],
      transition: {
        duration: 0.9,
        times: [0, 0.38, 0.62, 1],
        ease: ["easeOut", "easeIn", "easeOut"],
      },
    });
    void ink.start({
      opacity: [0, 0, 0.7, 0.35],
      scale: [0.4, 0.55, 1.18, 1],
      transition: { duration: 0.9, times: [0, 0.45, 0.7, 1] },
    });
    void wax.start({
      opacity: [0, 0, 1],
      scale: [0.6, 0.6, 1],
      rotate: [-20, -20, -8],
      transition: { duration: 0.9, times: [0, 0.5, 1] },
    });

    const timeout = window.setTimeout(() => {
      if (!serious) {
        play("thud");
        vibrate([40, 30, 80]);
      }
    }, 540);

    return () => window.clearTimeout(timeout);
  }, [ink, play, press, serious, settings.reducedMotion, wax]);

  return (
    <div
      className="relative flex min-h-[250px] items-center justify-center py-6 sm:min-h-[300px]"
      style={{ perspective: "1100px" }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-4 inset-y-5 -rotate-1 rounded-xl border-2 border-line/15 bg-paper/80 paper-sheet sm:inset-x-10"
      />
      <div className="absolute left-5 top-3 -rotate-2 rounded bg-butter px-2 py-1 text-[8px] font-extrabold uppercase tracking-[0.14em] text-[#5e3a00] sm:left-12">
        Exhibits attached
      </div>

      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.4 }}
        animate={ink}
        className="absolute h-40 w-56 rounded-[2.2rem] sm:h-52 sm:w-72"
        style={{
          background: `radial-gradient(circle, ${meta.color}33 0%, transparent 70%)`,
          filter: "blur(6px)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: -28, rotateX: 58, rotateZ: -12, scale: 0.86 }}
        animate={press}
        className="relative z-10"
        style={{ transformStyle: "preserve-3d", transformOrigin: "50% 100%" }}
        aria-label={`Verdict stamp: ${meta.official}. ${serious ? "Serious mode." : ""}`}
        role="img"
      >
        <div
          className="relative rounded-[1.7rem] border-[6px] px-7 py-6 text-center sm:border-[8px] sm:px-14 sm:py-9"
          style={{
            color: meta.deep,
            borderColor: meta.deep,
            background: `linear-gradient(145deg, ${meta.bg} 0%, #fffaf0 42%, ${meta.bg} 100%)`,
            boxShadow: `
              inset 0 1px 0 rgba(255,255,255,0.7),
              inset 0 -10px 18px ${meta.color}22,
              0 14px 0 ${meta.deep}22,
              0 22px 28px rgba(0,0,0,0.18)
            `,
            transform: "translateZ(28px)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-[7px] rounded-[1.15rem] border border-dashed opacity-40"
            style={{ borderColor: meta.deep }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-2 top-3 h-4 w-4 rounded-full opacity-50"
            style={{ background: meta.color }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-1 bottom-4 h-3 w-3 rounded-full opacity-40"
            style={{ background: meta.color }}
          />
          <p className="relative font-display text-[clamp(2.2rem,9vw,4.8rem)] font-black uppercase leading-none tracking-tight">
            {label}
          </p>
          {skinActive && (
            <p className="relative mt-2 text-[9px] font-extrabold uppercase tracking-[0.18em] opacity-70">
              Official: {meta.official}
            </p>
          )}
          <p className="relative mt-2 text-[8px] font-extrabold uppercase tracking-[0.2em] opacity-60">
            Is It True? · AI-assisted
          </p>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-x-6 -bottom-3 h-3 rounded-full bg-black/20 blur-[6px]"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
        animate={wax}
        aria-hidden="true"
        className="absolute bottom-4 right-6 flex h-14 w-14 items-center justify-center rounded-full border-4 sm:right-14"
        style={{
          borderColor: meta.deep,
          background: meta.color,
          boxShadow: "inset 0 -6px 0 rgba(0,0,0,0.18), 0 8px 0 rgba(0,0,0,0.12)",
          color: "#fffaf0",
        }}
      >
        <span className="font-display text-[10px] font-black uppercase leading-none">
          {meta.official.slice(0, 4)}
        </span>
      </motion.div>
    </div>
  );
}
