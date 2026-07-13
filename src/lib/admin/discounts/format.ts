import { formatCurrency, type Currency } from "@/lib/currency";
import type { AdminDiscountRow, DiscountDetail, DiscountType } from "./types";

type DbDiscount = {
  id: string;
  code: string;
  description: string | null;
  percent_off: number | null;
  amount_off: number | null;
  currency: string | null;
  max_uses: number | null;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
};

function resolveType(row: Pick<DbDiscount, "percent_off" | "amount_off">): DiscountType {
  return row.percent_off != null ? "percent" : "fixed";
}

function formatDateLabel(iso: string | null, locale = "en"): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat(locale === "sv" ? "sv-SE" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function toDateInputValue(iso: string | null): string | null {
  if (!iso) return null;
  return iso.slice(0, 10);
}

export function mapDiscountDetail(row: DbDiscount): DiscountDetail {
  const type = resolveType(row);
  return {
    id: row.id,
    code: row.code,
    description: row.description,
    type,
    percentOff: row.percent_off != null ? Number(row.percent_off) : null,
    amountOff: row.amount_off != null ? Number(row.amount_off) : null,
    currency: (row.currency as Currency | null) ?? null,
    maxUses: row.max_uses,
    usedCount: row.used_count,
    startsAt: toDateInputValue(row.starts_at),
    expiresAt: toDateInputValue(row.expires_at),
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

export function mapDiscountRow(row: DbDiscount, locale = "en"): AdminDiscountRow {
  const type = resolveType(row);
  const percentOff = row.percent_off != null ? Number(row.percent_off) : null;
  const amountOff = row.amount_off != null ? Number(row.amount_off) : null;
  const currency = (row.currency as Currency | null) ?? null;

  const valueLabel =
    type === "percent"
      ? `${percentOff}%`
      : formatCurrency(amountOff ?? 0, currency ?? "USD", locale === "sv" ? "sv-SE" : "en-US");

  const usageLabel =
    row.max_uses == null ? `${row.used_count} / ∞` : `${row.used_count} / ${row.max_uses}`;

  return {
    id: row.id,
    code: row.code,
    description: row.description,
    type,
    typeLabel: type === "percent" ? "Percentage" : "Fixed",
    valueLabel,
    percentOff,
    amountOff,
    currency,
    maxUses: row.max_uses,
    usedCount: row.used_count,
    usageLabel,
    startsAt: toDateInputValue(row.starts_at),
    expiresAt: toDateInputValue(row.expires_at),
    startsAtLabel: formatDateLabel(row.starts_at, locale),
    expiresAtLabel: formatDateLabel(row.expires_at, locale),
    isActive: row.is_active,
    statusLabel: row.is_active ? "Active" : "Inactive",
    createdAt: row.created_at,
  };
}
