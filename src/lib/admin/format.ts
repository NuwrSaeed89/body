import type { AdminMetricTrend } from "./types";

const COMPLETED_ORDER_STATUSES = new Set([
  "paid",
  "processing",
  "shipped",
  "delivered",
]);

export function isCompletedOrderStatus(status: string): boolean {
  return COMPLETED_ORDER_STATUSES.has(status);
}

export function formatOrderStatusLabel(status: string): string {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatSekAmount(amount: number, locale: string): string {
  const intlLocale = locale === "sv" ? "sv-SE" : locale === "de" ? "de-DE" : "en-SE";
  return new Intl.NumberFormat(intlLocale, {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return String(value);
}

export function formatInteger(value: number, locale: string): string {
  const intlLocale = locale === "sv" ? "sv-SE" : "en-SE";
  return new Intl.NumberFormat(intlLocale).format(value);
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

export function formatDelta(current: number, previous: number): {
  delta: string;
  trend: AdminMetricTrend;
} {
  if (previous === 0) {
    if (current === 0) return { delta: "0%", trend: "up" };
    return { delta: "+100%", trend: "up" };
  }
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? "+" : "";
  return {
    delta: `${sign}${change.toFixed(1)}%`,
    trend: change >= 0 ? "up" : "down",
  };
}

export function formatOrderDate(iso: string, locale: string): string {
  const intlLocale = locale === "sv" ? "sv-SE" : locale === "de" ? "de-DE" : "en-US";
  return new Intl.DateTimeFormat(intlLocale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function lastNMonthBuckets(n: number): { key: string; label: string; start: Date }[] {
  const buckets: { key: string; label: string; start: Date }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i -= 1) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: monthKey(start),
      label: start.toLocaleString("en", { month: "short" }),
      start,
    });
  }
  return buckets;
}
