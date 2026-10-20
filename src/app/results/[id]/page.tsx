import type { Metadata } from "next";
import { ResultView } from "@/components/results/result-view";

export const metadata: Metadata = {
  title: "Case file",
  description:
    "Verdict, confidence, reasoning and sources for a fact-checked claim.",
};

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="page-shell">
      <ResultView id={id} />
    </div>
  );
}
