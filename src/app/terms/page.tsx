import type { Metadata } from "next";
import { LegalView } from "@/components/legal/legal-view";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "AI-assisted estimates, play money only, and no absolute truth. Use Is It True as a starting point.",
};

export default function TermsPage() {
  return (
    <div className="page-shell">
      <LegalView kind="terms" />
    </div>
  );
}
