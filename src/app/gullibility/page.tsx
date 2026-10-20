import type { Metadata } from "next";
import { GullibilityView } from "@/components/gullibility/gullibility-view";

export const metadata: Metadata = {
  title: "Gullibility score",
  description: "A friendly read of your Guess First record. Never a mockery.",
};

export default function GullibilityPage() {
  return (
    <div className="page-shell">
      <GullibilityView />
    </div>
  );
}
