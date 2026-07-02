import { PRODUCT_CURRENCIES, PRODUCT_STATUSES } from "./constants";
import type { ProductWriteInput } from "./types";

export type ProductValidationResult =
  | { ok: true; data: ProductWriteInput }
  | { ok: false; error: string };

function readString(value: unknown, field: string): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed;
}

function readOptionalString(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") return null;
  return value.trim() || null;
}

function readBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === 1) return true;
  if (value === "false" || value === 0) return false;
  return fallback;
}

function readNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function parseProductWriteBody(body: unknown): ProductValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body" };
  }

  const raw = body as Record<string, unknown>;

  const slug = readString(raw.slug, "slug");
  if (!slug) return { ok: false, error: "Slug is required" };
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return { ok: false, error: "Slug must be lowercase letters, numbers, and hyphens" };
  }

  const name = readString(raw.name, "name");
  if (!name) return { ok: false, error: "Name is required" };

  const status = readString(raw.status, "status");
  if (!status || !PRODUCT_STATUSES.includes(status as (typeof PRODUCT_STATUSES)[number])) {
    return { ok: false, error: "Status must be draft, active, or archived" };
  }

  const basePrice = readNumber(raw.basePrice);
  if (basePrice === null || basePrice < 0) {
    return { ok: false, error: "Base price must be a non-negative number" };
  }

  const stock = readNumber(raw.stock);
  if (stock === null || stock < 0 || !Number.isInteger(stock)) {
    return { ok: false, error: "Stock must be a non-negative whole number" };
  }

  const compareAtPrice = readNumber(raw.compareAtPrice);
  if (compareAtPrice !== null && compareAtPrice < 0) {
    return { ok: false, error: "Compare-at price must be non-negative" };
  }

  const currency = readString(raw.currency, "currency") ?? "SEK";
  if (!PRODUCT_CURRENCIES.includes(currency as (typeof PRODUCT_CURRENCIES)[number])) {
    return { ok: false, error: "Currency must be SEK, USD, or EUR" };
  }

  const lowStockThreshold = readNumber(raw.lowStockThreshold);
  if (lowStockThreshold !== null && (lowStockThreshold < 0 || !Number.isInteger(lowStockThreshold))) {
    return { ok: false, error: "Low stock threshold must be a non-negative whole number" };
  }

  const locale = readString(raw.locale, "locale") ?? "en";
  if (!["en", "sv", "es", "de"].includes(locale)) {
    return { ok: false, error: "Locale must be en, sv, es, or de" };
  }

  const categoryId = readOptionalString(raw.categoryId);

  return {
    ok: true,
    data: {
      slug,
      name,
      description: readOptionalString(raw.description),
      status: status as ProductWriteInput["status"],
      basePrice,
      compareAtPrice: compareAtPrice ?? null,
      currency: currency as ProductWriteInput["currency"],
      stock,
      isLatestDrop: readBoolean(raw.isLatestDrop),
      isPremium: readBoolean(raw.isPremium),
      isBestSeller: readBoolean(raw.isBestSeller),
      isTemporarilyUnavailable: readBoolean(raw.isTemporarilyUnavailable),
      lowStockThreshold: lowStockThreshold ?? 5,
      locale,
      categoryId,
    },
  };
}
