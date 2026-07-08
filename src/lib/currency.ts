export const CURRENCIES = ["USD", "EUR", "SEK"] as const;

export type Currency = (typeof CURRENCIES)[number];

/** Catalog amounts in mock/legacy paths are stored as SEK-equivalent base units. */
export const BASE_CURRENCY: Currency = "SEK";
/** Default shopper + admin display currency. */
export const DEFAULT_CURRENCY: Currency = "USD";
/** Default currency for new product prices in admin. */
export const DEFAULT_PRODUCT_CURRENCY: Currency = "USD";
/** Admin dashboard + reports display currency. */
export const ADMIN_DISPLAY_CURRENCY: Currency = DEFAULT_CURRENCY;
export const CURRENCY_STORAGE_KEY = "mbody-currency";
export const CURRENCY_COOKIE = "mbody-currency";

/** Sweden standard VAT rate — prices are stored and displayed VAT-inclusive. */
export const VAT_RATE_SE = 0.25;

/**
 * Mock FX: SEK per 1 unit of target currency (Phase 1 static rates; replace via API/DB later).
 * Example: 1 EUR ≈ 11.2 SEK → 990 SEK ≈ €88.39
 */
export const SEK_PER_UNIT: Record<Currency, number> = {
  SEK: 1,
  EUR: 11.2,
  USD: 10.4,
};

export const FREE_SHIPPING_THRESHOLDS: Record<Currency, number> = {
  SEK: 499,
  USD: 45,
  EUR: 45,
};

/** Flat standard shipping when subtotal is below the free-shipping threshold (VAT-inclusive SEK). */
export const STANDARD_SHIPPING_FEE_SEK = 79;

/** Express upgrade at checkout (VAT-inclusive SEK; shown as premium option). */
export const EXPRESS_SHIPPING_FEE_SEK = 125;

export function isCurrency(value: string): value is Currency {
  return (CURRENCIES as readonly string[]).includes(value);
}

export function parseCurrency(value: string | undefined | null): Currency {
  if (value && isCurrency(value)) return value;
  return DEFAULT_CURRENCY;
}

export function roundMoney(amount: number, currency: Currency): number {
  const decimals = currency === "SEK" ? 0 : 2;
  const factor = 10 ** decimals;
  return Math.round(amount * factor) / factor;
}

/** Convert an amount in the given currency to SEK (catalog base). */
export function amountToSek(amount: number, currency: Currency): number {
  if (currency === "SEK") return roundMoney(amount, "SEK");
  return roundMoney(amount * SEK_PER_UNIT[currency], "SEK");
}

/** Convert between any supported currencies via SEK. */
export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency,
): number {
  if (from === to) return roundMoney(amount, to);
  const amountSek = amountToSek(amount, from);
  return convertFromSek(amountSek, to);
}

/** Convert a VAT-inclusive SEK amount to the selected display currency. */
export function convertFromSek(amountSek: number, currency: Currency): number {
  if (currency === "SEK") return roundMoney(amountSek, "SEK");
  return roundMoney(amountSek / SEK_PER_UNIT[currency], currency);
}

export function formatCurrency(
  amount: number,
  currency: Currency,
  locale: string,
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "SEK" ? 0 : 2,
    maximumFractionDigits: currency === "SEK" ? 0 : 2,
  }).format(amount);
}

/** Format a VAT-inclusive SEK catalog price in the shopper's currency. */
export function formatPriceFromSek(
  amountSek: number,
  currency: Currency,
  locale: string,
): string {
  return formatCurrency(convertFromSek(amountSek, currency), currency, locale);
}

/** Extract VAT portion from a VAT-inclusive amount (for cart breakdown). */
export function extractVatFromInclusive(
  inclusiveAmount: number,
  vatRate = VAT_RATE_SE,
  currency: Currency = BASE_CURRENCY,
): number {
  const vat = inclusiveAmount - inclusiveAmount / (1 + vatRate);
  return roundMoney(vat, currency);
}

export function qualifiesForFreeShipping(amountSek: number): boolean {
  return amountSek >= FREE_SHIPPING_THRESHOLDS.SEK;
}

export function calculateShippingSek(subtotalSek: number): number {
  return qualifiesForFreeShipping(subtotalSek) ? 0 : STANDARD_SHIPPING_FEE_SEK;
}

export function amountUntilFreeShippingSek(subtotalSek: number): number {
  if (qualifiesForFreeShipping(subtotalSek)) return 0;
  return Math.max(0, FREE_SHIPPING_THRESHOLDS.SEK - subtotalSek);
}

export function formatFreeShippingThreshold(
  currency: Currency,
  locale: string,
): string {
  return formatCurrency(FREE_SHIPPING_THRESHOLDS[currency], currency, locale);
}

export type InclusiveCartTotals = {
  subtotalSek: number;
  vatSek: number;
  totalSek: number;
  currency: Currency;
  locale: string;
  subtotal: string;
  vat: string;
  total: string;
};

export type CartSummary = InclusiveCartTotals & {
  shippingSek: number;
  freeShipping: boolean;
  amountUntilFreeShippingSek: number;
  amountUntilFreeShipping: string;
  freeShippingThreshold: string;
  grandTotalSek: number;
  grandTotal: string;
  shipping: string;
};

export function calculateInclusiveCartTotals(
  subtotalSek: number,
  currency: Currency,
  locale: string,
): InclusiveCartTotals {
  const vatSek = extractVatFromInclusive(subtotalSek, VAT_RATE_SE, BASE_CURRENCY);
  return {
    subtotalSek,
    vatSek,
    totalSek: subtotalSek,
    currency,
    locale,
    subtotal: formatPriceFromSek(subtotalSek, currency, locale),
    vat: formatPriceFromSek(vatSek, currency, locale),
    total: formatPriceFromSek(subtotalSek, currency, locale),
  };
}

/** Subtotal + shipping; free when subtotal ≥ 499 SEK (45 USD / 45 EUR equivalent). */
export function calculateCartSummary(
  subtotalSek: number,
  currency: Currency,
  locale: string,
): CartSummary {
  const base = calculateInclusiveCartTotals(subtotalSek, currency, locale);
  const freeShipping = qualifiesForFreeShipping(subtotalSek);
  const shippingSek = calculateShippingSek(subtotalSek);
  const untilSek = amountUntilFreeShippingSek(subtotalSek);
  const grandTotalSek = subtotalSek + shippingSek;

  return {
    ...base,
    shippingSek,
    freeShipping,
    amountUntilFreeShippingSek: untilSek,
    amountUntilFreeShipping: formatPriceFromSek(untilSek, currency, locale),
    freeShippingThreshold: formatFreeShippingThreshold(currency, locale),
    grandTotalSek,
    grandTotal: formatPriceFromSek(grandTotalSek, currency, locale),
    shipping: formatPriceFromSek(shippingSek, currency, locale),
  };
}

/** @deprecated Use formatPriceFromSek from this module or useCurrency().formatFromSek */
export function formatPrice(amount: number, currency: string, locale: string) {
  const resolved = isCurrency(currency) ? currency : DEFAULT_CURRENCY;
  return formatCurrency(amount, resolved, locale);
}
