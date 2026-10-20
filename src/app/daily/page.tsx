import type { Metadata } from "next";
import { Suspense } from "react";
import { DailyGame } from "@/components/daily/daily-game";

export const metadata: Metadata = {
  title: "Cap or No Cap? — Daily Game",
  description:
    "Five claims a day. Swipe your guess, reveal the evidence, collect play coins.",
};

export default function DailyPage() {
  return (
    <div className="page-shell">
      <Suspense
        fallback={
          <div className="mx-auto mt-12 h-96 max-w-xl animate-pulse rounded-[2rem] bg-clay/60" />
        }
      >
        <DailyGame />
      </Suspense>
    </div>
  );
}
