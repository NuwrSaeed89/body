export function orderStatusTone(statusRaw: string): string {
  if (statusRaw === "delivered" || statusRaw === "shipped") {
    return "bg-surface-container-high text-primary";
  }
  if (statusRaw === "cancelled" || statusRaw === "returned") {
    return "bg-surface-variant text-on-surface";
  }
  if (statusRaw === "pending_payment") {
    return "bg-surface-variant text-on-surface-variant";
  }
  return "bg-primary/10 text-primary";
}
