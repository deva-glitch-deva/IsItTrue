"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSettings } from "./settings-provider";

export function SmoothScroll() {
  const { settings, hydrated } = useSettings();
  const pathname = usePathname();

  useEffect(() => {
    if (!hydrated || settings.reducedMotion) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    void (async () => {
      try {
        const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
          import("lenis"),
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);
        const lenis = new Lenis({
          duration: 1.05,
          smoothWheel: true,
          touchMultiplier: 1.3,
        });
        lenis.on("scroll", ScrollTrigger.update);
        const update = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(update);
        gsap.ticker.lagSmoothing(0);
        cleanup = () => {
          gsap.ticker.remove(update);
          ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
          lenis.destroy();
        };
      } catch {
        // Native scroll is a perfectly fine fallback.
      }
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [settings.reducedMotion, hydrated]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}
