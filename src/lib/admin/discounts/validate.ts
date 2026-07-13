import { CURRENCIES, DEFAULT_PRODUCT_CURRENCY, type Currency } from "@/lib/currency";
import type { DiscountType, DiscountWriteInput } from "./types";

export type DiscountValidationResult =
  | { ok: true; data: DiscountWriteInput }
  | { ok: false; error: string };

function readString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function readBoolean(value: unknown, fallback = true): boolean {
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

function readOptionalDate(value: unknown, field: string): { ok: true; value: string | null } | { ok: false; error: string } {
  if (value == null || value === "") return { ok: true, value: null };
  if (typeof value !== "string") return { ok: false, error: `${field} must be a date string` };

  const trimmed = value.trim();
  const slashMatch = trimmed.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  const dashMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const parts = slashMatch ?? dashMatch;

  if (!parts) {
    return { ok: false, error: `${field} must use yyyy/mm/dd` };
  }

  const [, year, month, day] = parts;
  const isoCandidate = `${year}-${month}-${day}T00:00:00.000Z`;
  const parsed = new Date(isoCandidate);
  if (Number.isNaN(parsed.getTime())) {
    return { ok: false, error: `${field} is not a valid date` };
  }
  return { ok: true, value: parsed.toISOString() };
}

function isCurrency(value: string): value is Currency {
  return (CURRENCIES as readonly string[]).includes(value);
}

export function parseDiscountWriteBody(body: unknown): DiscountValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body" };
  }

  const raw = body as Record<string, unknown>;

  const code = readString(raw.code)?.toUpperCase() ?? null;
  if (!code) return { ok: false, error: "Code is required" };
  if (!/^[A-Z0-9][A-Z0-9_-]{1,31}$/.test(code)) {
    return {
      ok: false,
      error: "Code must be 2–32 characters: letters, numbers, underscore, or hyphen",
    };
  }

  const description = readString(raw.description);

  const typeRaw = readString(raw.type)?.toLowerCase();
  const type: DiscountType =
    typeRaw === "fixed" || typeRaw === "percent"
      ? typeRaw
      : raw.amountOff != null && raw.amountOff !== ""
        ? "fixed"
        : "percent";

  let percentOff: number | null = null;
  let amountOff: number | null = null;
  let currency: Currency | null = null;

  if (type === "percent") {
    percentOff = readNumber(raw.percentOff);
    if (percentOff === null || percentOff <= 0 || percentOff > 100) {
      return { ok: false, error: "Percent off must be greater than 0 and at most 100" };
    }
  } else {
    amountOff = readNumber(raw.amountOff);
    if (amountOff === null || amountOff < 0) {
      return { ok: false, error: "Amount off must be a non-negative number" };
    }
    const currencyRaw = readString(raw.currency)?.toUpperCase() ?? DEFAULT_PRODUCT_CURRENCY;
    if (!isCurrency(currencyRaw)) {
      return { ok: false, error: "Currency must be USD, EUR, or SEK" };
    }
    currency = currencyRaw;
  }

  const maxUsesRaw = raw.maxUses;
  let maxUses: number | null = null;
  if (maxUsesRaw != null && maxUsesRaw !== "") {
    maxUses = readNumber(maxUsesRaw);
    if (maxUses === null || maxUses < 1 || !Number.isInteger(maxUses)) {
      return { ok: false, error: "Usage limit must be a whole number of at least 1" };
    }
  }

  const startsAtResult = readOptionalDate(raw.startsAt, "Start date");
  if (!startsAtResult.ok) return startsAtResult;
  const expiresAtResult = readOptionalDate(raw.expiresAt, "Expiry date");
  if (!expiresAtResult.ok) return expiresAtResult;

  if (
    startsAtResult.value &&
    expiresAtResult.value &&
    new Date(expiresAtResult.value).getTime() < new Date(startsAtResult.value).getTime()
  ) {
    return { ok: false, error: "Expiry date must be on or after the start date" };
  }

  return {
    ok: true,
    data: {
      code,
      description,
      type,
      percentOff,
      amountOff,
      currency,
      maxUses,
      startsAt: startsAtResult.value,
      expiresAt: expiresAtResult.value,
      isActive: readBoolean(raw.isActive, true),
    },
  };
}
