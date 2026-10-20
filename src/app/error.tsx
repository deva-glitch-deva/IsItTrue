"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="sticker rotate-2 bg-false/30">Snag</p>
        <h1 className="section-title mt-4">Something jammed the stamp</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          A client error stopped this screen. Your input is not lost if it is
          still in this tab.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" className="btn-secondary" onClick={reset}>
            Try again
          </button>
          <Link href="/verify" className="btn-primary">
            New check
          </Link>
        </div>
      </div>
    </div>
  );
}
