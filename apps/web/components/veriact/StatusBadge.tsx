"use client";

import { clsx } from "clsx";

type Status = "OPEN" | "CLOSED" | "EXPIRED" | "PENDING" | "VERIFYING" | "VERIFIED" | "REJECTED" | "PAID";

const styles: Record<Status, string> = {
  OPEN: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  CLOSED: "bg-white/10 text-white/70 border-white/20",
  EXPIRED: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  PENDING: "bg-white/10 text-white/70 border-white/20",
  VERIFYING: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  VERIFIED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  REJECTED: "bg-red-500/20 text-red-400 border-red-500/30",
  PAID: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

export function StatusBadge({ status }: { status: Status }) {
  const label = `Status: ${status}`;
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[status] ?? "bg-white/10 text-white/70"
      )}
      aria-label={label}
    >
      {status}
    </span>
  );
}
