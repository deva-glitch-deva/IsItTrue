import type { Metadata } from "next";
import { TrendingView } from "@/components/trending/trending-view";

export const metadata: Metadata = {
  title: "Trending claims",
  description:
    "The most-checked claims from the last 24 hours, with sensitive topics handled in Serious Mode.",
};

export default function TrendingPage() {
  return (
    <div className="page-shell">
      <TrendingView />
    </div>
  );
}
