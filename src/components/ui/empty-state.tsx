"use client";

import Link from "next/link";
import { SearchIcon } from "@/components/icons";

export function EmptyState({
  title,
  body,
  action,
  href,
}: {
  title: string;
  body?: string;
  action?: string;
  href?: string;
}) {
  return (
    <div className="clay-card flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-5 flex h-16 w-16 -rotate-6 items-center justify-center rounded-2xl border-2 border-line/20 bg-butter shadow-sticker">
        <SearchIcon className="h-8 w-8" />
      </div>
      <h3 className="font-display text-2xl font-extrabold">{title}</h3>
      {body && <p className="mt-2 max-w-sm text-sm text-muted">{body}</p>}
      {action && href && (
        <Link href={href} className="btn-primary mt-6">
          {action}
        </Link>
      )}
    </div>
  );
}
