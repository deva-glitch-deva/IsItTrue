"use client";

import Link from "next/link";
import { useSettings } from "@/components/providers/settings-provider";
import { ArrowRightIcon } from "@/components/icons";

const STEPS = [
  { title: "how.step1", sub: "how.step1sub" },
  { title: "how.step2", sub: "how.step2sub" },
  { title: "how.step3", sub: "how.step3sub" },
  { title: "how.step4", sub: "how.step4sub" },
  { title: "how.step5", sub: "how.step5sub" },
] as const;

export function HowItWorksView() {
  const { t } = useSettings();
  return (
    <div className="mx-auto max-w-3xl">
      <span className="sticker -rotate-2 bg-sky/40">Pipeline</span>
      <h1 className="section-title mt-3">{t("how.title")}</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
        {t("how.subtitle")}
      </p>

      <ol className="mt-8 space-y-3">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="clay-card flex items-start gap-4 p-4 sm:p-5"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-line/20 bg-hot font-display text-lg font-black text-[#1a0e08]">
              {index + 1}
            </span>
            <div>
              <p className="font-display text-xl font-black">{t(step.title)}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {t(step.sub)}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-6 rounded-2xl border-2 border-dashed border-line/20 bg-paper/50 p-4 text-xs leading-relaxed text-muted">
        {t("footer.disclaimer")} {t("results.needTwo")}
      </p>

      <Link href="/verify" className="btn-primary mt-6">
        {t("home.cta")}
        <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </div>
  );
}
