"use client";

import { Badge } from "@/components/ui/badge";

type Status =
  | "OPEN"
  | "CLOSED"
  | "EXPIRED"
  | "PENDING"
  | "VERIFYING"
  | "VERIFIED"
  | "REJECTED"
  | "PAID";

const statusVariantMap: Record<Status, "success" | "secondary" | "warning" | "muted" | "error"> = {
  OPEN: "success",
  CLOSED: "secondary",
  EXPIRED: "warning",
  PENDING: "muted",
  VERIFYING: "secondary",
  VERIFIED: "success",
  REJECTED: "error",
  PAID: "success",
};

export function StatusBadge({ status }: { status: Status }) {
  const variant = statusVariantMap[status] ?? "secondary";
  return (
    <Badge variant={variant} aria-label={`Status: ${status}`}>
      {status}
    </Badge>
  );
}
