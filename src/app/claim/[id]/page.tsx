import type { Metadata } from "next";
import { ClaimDetailView } from "@/components/results/claim-detail-view";

export const metadata: Metadata = {
  title: "Claim breakdown",
  description:
    "Claim-by-claim breakdown with the Reel says vs Sources say split view.",
};

export default async function ClaimPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ n?: string }>;
}) {
  const { id } = await params;
  const { n } = await searchParams;
  const index = Math.max(0, Number.parseInt(n ?? "0", 10) || 0);
  return (
    <div className="page-shell">
      <ClaimDetailView id={id} initialIndex={index} />
    </div>
  );
}
