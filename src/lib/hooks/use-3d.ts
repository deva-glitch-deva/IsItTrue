"use client";

import { useEffect, useRef, useState } from "react";
import { useSettings } from "@/components/providers/settings-provider";

export function use3dAllowed(): boolean {
  const { settings } = useSettings();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (settings.reducedMotion) {
      setAllowed(false);
      return;
    }
    const memory = (navigator as Navigator & { deviceMemory?: number })
      .deviceMemory;
    const cores = navigator.hardwareConcurrency ?? 8;
    const coarse = window.matchMedia("(max-width: 480px)").matches;
    if ((memory && memory <= 2) || cores <= 2) {
      setAllowed(false);
      return;
    }
    setAllowed(!coarse);
  }, [settings.reducedMotion]);

  return allowed;
}

export function useInView<T extends Element>(rootMargin = "160px") {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, inView };
}
