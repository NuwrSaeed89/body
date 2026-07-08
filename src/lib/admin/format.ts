export { ADMIN_DISPLAY_CURRENCY } from "@/lib/currency";

import type { AdminMetricTrend } from "./types";
import {
  ADMIN_DISPLAY_CURRENCY,
  amountToSek,
  convertFromSek,
  formatCurrency,
  isCurrency,
  type Currency,
} from "@/lib/currency";

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

function intlLocale(locale: string): string {
  if (locale === "sv") return "sv-SE";
  if (locale === "de") return "de-DE";
  return "en-US";
}

export function formatAdminAmount(
  amount: number,
  locale: string,
  currency: Currency = ADMIN_DISPLAY_CURRENCY,
): string {
  return formatCurrency(amount, currency, intlLocale(locale));
}

export function formatAdminDisplayAmount(
  amount: number,
  fromCurrency: string,
  locale: string,
): string {
  const currency = isCurrency(fromCurrency) ? fromCurrency : "SEK";
  const displayAmount = convertFromSek(amountToSek(amount, currency), ADMIN_DISPLAY_CURRENCY);
  return formatAdminAmount(displayAmount, locale, ADMIN_DISPLAY_CURRENCY);
}

/** @deprecated Use formatAdminAmount or formatAdminDisplayAmount */
export function formatSekAmount(amount: number, locale: string): string {
  return formatAdminDisplayAmount(amount, "SEK", locale);
}

export function formatCompactCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return String(value);
}

export function formatInteger(value: number, locale: string): string {
  const intl = locale === "sv" ? "sv-SE" : "en-US";
  return new Intl.NumberFormat(intl).format(value);
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
  return new Intl.DateTimeFormat(intlLocale(locale), {
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

export function sumInAdminDisplayCurrency(
  rows: { amount: number; currency?: string | null }[],
): number {
  return rows.reduce((sum, row) => {
    const currency: Currency = isCurrency(row.currency ?? "") ? (row.currency as Currency) : "SEK";
    const amountSek = amountToSek(Number(row.amount), currency);
    return sum + convertFromSek(amountSek, ADMIN_DISPLAY_CURRENCY);
  }, 0);
}
