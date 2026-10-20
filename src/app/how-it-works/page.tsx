import type { Metadata } from "next";
import { HowItWorksView } from "@/components/how/how-it-works-view";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "Claim or Reel in, evidence search, source comparison, analysis, then a labelled result. Never absolute truth.",
};

export default function HowItWorksPage() {
  return (
    <div className="page-shell">
      <HowItWorksView />
    </div>
  );
}
