import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-shell">
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="sticker -rotate-2 bg-candy">404</p>
        <h1 className="section-title mt-4">Case file missing</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          That page is not on the board. The detector still works — start a new
          check.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className="btn-secondary">
            Home
          </Link>
          <Link href="/verify" className="btn-primary">
            Check a claim
          </Link>
        </div>
      </div>
    </div>
  );
}
