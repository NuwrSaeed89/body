"use client";

import type { WaitingNotifyStatus } from "@/lib/admin/waiting-list/types";

export function AdminWaitingStatusBadge({ status }: { status: WaitingNotifyStatus }) {
  const waiting = status === "waiting";
  return (
    <span
      className={`inline-block rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${
        waiting
          ? "bg-primary/10 text-primary"
          : "bg-surface-container-high text-on-surface-variant"
      }`}
    >
      {waiting ? "Waiting" : "Notified"}
    </span>
  );
}
