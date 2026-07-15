import { formatOrderDate } from "@/lib/admin/format";
import type { AdminWaitingListRow, WaitingNotifyStatus } from "./types";

export function waitingStatusLabel(status: WaitingNotifyStatus): string {
  return status === "notified" ? "Notified" : "Waiting";
}

export function mapWaitingListRow(input: {
  id: string;
  email: string;
  productId: string;
  productSlug: string;
  productName: string;
  variantId: string | null;
  size: string | null;
  color: string | null;
  userId: string | null;
  notifiedAt: string | null;
  createdAt: string;
  locale: string;
}): AdminWaitingListRow {
  const status: WaitingNotifyStatus = input.notifiedAt ? "notified" : "waiting";
  const size = input.size?.trim() || null;
  const color = input.color?.trim() || null;
  const variantParts = [size, color].filter(Boolean);

  return {
    id: input.id,
    email: input.email,
    productId: input.productId,
    productSlug: input.productSlug,
    productName: input.productName,
    variantId: input.variantId,
    variantLabel: variantParts.length > 0 ? variantParts.join(" · ") : "Any variant",
    size,
    color,
    userId: input.userId,
    status,
    statusLabel: waitingStatusLabel(status),
    notifiedAt: input.notifiedAt,
    notifiedAtLabel: input.notifiedAt ? formatOrderDate(input.notifiedAt, input.locale) : "—",
    createdAt: input.createdAt,
    createdAtLabel: formatOrderDate(input.createdAt, input.locale),
  };
}
