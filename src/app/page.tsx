import type { Metadata } from "next";
import { HomeView } from "@/components/home/home-view";

export const metadata: Metadata = {
  title: "Is It True? — Your pocket lie detector",
};

export default function HomePage() {
  return <HomeView />;
}
