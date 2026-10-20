import type { Metadata } from "next";
import { SettingsView } from "@/components/settings/settings-view";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Theme, language, verdict skin, sound, haptics, reduced motion, Serious Mode and device data controls.",
};

export default function SettingsPage() {
  return (
    <div className="page-shell">
      <SettingsView />
    </div>
  );
}
