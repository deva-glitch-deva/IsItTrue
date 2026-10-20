import type { Metadata } from "next";
import { LegalView } from "@/components/legal/legal-view";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "No accounts. History stays on this device. Cached claims are anonymized for up to 7 days.",
};

export default function PrivacyPage() {
  return (
    <div className="page-shell">
      <LegalView kind="privacy" />
    </div>
  );
}
