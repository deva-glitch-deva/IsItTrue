import type { Metadata } from "next";
import { HistoryView } from "@/components/history/history-view";

export const metadata: Metadata = {
  title: "History",
  description:
    "Your fact-check history, stored only on this device in IndexedDB. Search, export, delete or clear it.",
};

export default function HistoryPage() {
  return (
    <div className="page-shell">
      <HistoryView />
    </div>
  );
}
