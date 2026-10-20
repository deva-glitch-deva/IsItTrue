"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { VERDICT_META } from "@/lib/constants";
import { CheckIcon } from "@/components/icons";
import type { Verdict } from "@/lib/types";

const SOURCE_SLOTS = [
  { id: 1, x: 4, y: 8, fromX: "-32px", fromY: "-22px", rot: -8 },
  { id: 2, x: 66, y: 9, fromX: "32px", fromY: "-20px", rot: 7 },
  { id: 3, x: 4, y: 70, fromX: "-28px", fromY: "24px", rot: -6 },
  { id: 4, x: 66, y: 68, fromX: "30px", fromY: "22px", rot: 6 },
] as const;

export function Scanner({
  claim,
  stageIndex,
  settled,
  verdict,
  reducedMotion,
  steps,
  currentLabel,
}: {
  claim: string;
  stageIndex: number;
  settled: boolean;
  verdict: Verdict;
  reducedMotion: boolean;
  steps: string[];
  currentLabel: string;
}) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [coarse, setCoarse] = useState(false);
  const visibleSources = settled
    ? SOURCE_SLOTS.length
    : Math.min(SOURCE_SLOTS.length, Math.max(0, stageIndex));

  useEffect(() => {
    const media = window.matchMedia("(pointer: coarse)");
    const sync = () => setCoarse(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reducedMotion || coarse || event.pointerType === "touch") return;
    const node = boardRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width;
    const ny = (event.clientY - rect.top) / rect.height;
    setTilt({
      x: (0.5 - ny) * 10,
      y: (nx - 0.5) * 14,
    });
  }

  function onPointerLeave() {
    setTilt({ x: 0, y: 0 });
  }

  const meta = VERDICT_META[verdict];
  const preview = useMemo(() => {
    const text = claim.trim() || "Checking this claim";
    return text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text;
  }, [claim]);

  return (
    <div className="scanner-shell">
      <div
        ref={boardRef}
        className={`scanner-stage${coarse && !reducedMotion ? " scanner-float" : ""}`}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        style={{
          transform: reducedMotion
            ? undefined
            : `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
      >
        <div className="scanner-glow" aria-hidden="true" />
        <svg
          className="scanner-lines"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {SOURCE_SLOTS.map((slot, index) => (
            <line
              key={slot.id}
              x1="50"
              y1="50"
              x2={slot.x + 11}
              y2={slot.y + 8}
              className={index < visibleSources ? "is-on" : ""}
            />
          ))}
        </svg>

        {SOURCE_SLOTS.map((slot, index) => {
          const shown = index < visibleSources;
          return (
            <article
              key={slot.id}
              className={`scanner-source${shown ? " is-in" : ""}${reducedMotion ? " is-static" : ""}`}
              style={{
                left: `${slot.x}%`,
                top: `${slot.y}%`,
                "--from-x": slot.fromX,
                "--from-y": slot.fromY,
                "--card-rot": `${slot.rot}deg`,
                animationDelay: `${index * 90}ms`,
              } as CSSProperties}
            >
              <p className="scanner-source-kicker">Receipt {slot.id}</p>
              <p className="scanner-source-title">Source {slot.id}</p>
              <p className="scanner-source-hint">
                {settled ? "Attached" : "Checking"}
              </p>
            </article>
          );
        })}

        <article className={`scanner-claim${settled ? " is-stamped" : ""}`}>
          <p className="scanner-claim-kicker">Claim under review</p>
          <p className="scanner-claim-text">{preview}</p>
          <p className="scanner-claim-live">{currentLabel}</p>
          {settled && (
            <div
              className={`scanner-stamp${reducedMotion ? " is-static" : ""}`}
              style={{
                color: meta.deep,
                borderColor: meta.color,
                background: `${meta.bg}f2`,
              }}
            >
              <span>{meta.stamp}</span>
            </div>
          )}
        </article>
      </div>

      <ol className="scanner-log" aria-live="polite">
        {steps.map((label, index) => {
          const done = index < stageIndex || settled;
          const current = index === stageIndex && !settled;
          return (
            <li
              key={`${label}-${index}`}
              className={`scanner-log-row${done ? " is-done" : ""}${current ? " is-current" : ""}`}
            >
              <span className="scanner-log-mark">
                {done ? <CheckIcon className="h-3.5 w-3.5" /> : String(index + 1)}
              </span>
              <span className={current ? "scanner-type" : undefined}>{label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
