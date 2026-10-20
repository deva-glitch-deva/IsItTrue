"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useSettings } from "@/components/providers/settings-provider";
import { use3dAllowed, useInView } from "@/lib/hooks/use-3d";

const HeroScene = dynamic(() => import("./hero-scene"), {
  ssr: false,
  loading: () => <HeroFallback />,
});

function HeroFallback() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <div className="absolute h-40 w-40 rounded-full bg-hot opacity-90 shadow-[inset_-18px_-18px_0_rgba(0,0,0,0.12),0_24px_50px_rgba(0,0,0,0.22)] sm:h-56 sm:w-56 lg:h-64 lg:w-64" />
      <span className="relative z-10 -translate-y-1 font-display text-[6.5rem] font-black leading-none text-[#24170f] sm:text-[9rem] lg:text-[10rem]">
        ?
      </span>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute right-[8%] top-[12%] h-20 w-20 rounded-full border-[12px] border-mint bg-sky/40 sm:h-28 sm:w-28"
      />
      <motion.div
        animate={{ y: [0, -12, 0], rotate: [-8, 4, -8] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[15%] left-[8%] h-20 w-16 rotate-[-6deg] rounded-lg border-2 border-line/20 bg-cream p-2 shadow-sticker"
      >
        <div className="h-1.5 rounded bg-hot" />
        <div className="mt-1.5 h-1 rounded bg-muted/30" />
        <div className="mt-1 h-1 rounded bg-muted/30" />
        <div className="mt-1 h-1 w-2/3 rounded bg-muted/30" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[16%] top-[10%] h-10 w-10 rounded-lg bg-butter shadow-sticker"
      />
    </div>
  );
}

export function HeroCanvas() {
  const { settings } = useSettings();
  const allowed = use3dAllowed();
  const { ref, inView } = useInView<HTMLDivElement>("240px");
  const reduced = settings.reducedMotion;

  return (
    <div
      ref={ref}
      className="relative z-0 h-full w-full overflow-visible [mask-image:radial-gradient(ellipse_72%_68%_at_50%_48%,#000_42%,transparent_78%)] [-webkit-mask-image:radial-gradient(ellipse_72%_68%_at_50%_48%,#000_42%,transparent_78%)] [&>div]:!h-full [&>div]:!bg-transparent [&>canvas]:!block [&>canvas]:!bg-transparent"
      aria-label="Interactive 3D detective desk with a giant question mark, magnifying glass and red-string evidence"
      role="img"
    >
      {allowed && inView && !reduced ? (
        <HeroScene reducedMotion={reduced} />
      ) : (
        <HeroFallback />
      )}
    </div>
  );
}
