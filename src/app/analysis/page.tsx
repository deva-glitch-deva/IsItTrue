import type { Metadata } from "next";
import { AnalysisView } from "@/components/analysis/analysis-view";

export const metadata: Metadata = {
  title: "Analysis in progress",
  description: "Transcribing, extracting claims, searching and comparing evidence.",
};

export default function AnalysisPage() {
  return (
    <div className="page-shell">
      <AnalysisView />
    </div>
  );
}
