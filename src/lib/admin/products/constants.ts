/** Default variant when creating a product (matches mbody_init seed). */
export const DEFAULT_SIZE_CODE = "M";
export const DEFAULT_COLOR_CODE = "charcoal-black";

export const PRODUCT_STATUSES = ["draft", "active", "archived"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const PRODUCT_CURRENCIES = ["SEK", "USD", "EUR"] as const;
export type ProductCurrency = (typeof PRODUCT_CURRENCIES)[number];
