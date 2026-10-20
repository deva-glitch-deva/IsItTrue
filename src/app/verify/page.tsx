import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyForm } from "@/components/verify/verify-form";

export const metadata: Metadata = {
  title: "Verify a claim",
  description:
    "Paste a claim, add a Reel link, or upload a video or audio file. We extract the checkable claims and trace the evidence.",
};

export default function VerifyPage() {
  return (
    <div className="page-shell">
      <Suspense
        fallback={
          <div className="mx-auto mt-16 h-72 max-w-3xl animate-pulse rounded-[2rem] bg-clay/50" />
        }
      >
        <VerifyForm />
      </Suspense>
    </div>
  );
}
