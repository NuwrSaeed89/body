export const CATEGORY_LOCALES = ["en", "sv", "es", "de"] as const;

export type CategoryLocale = (typeof CATEGORY_LOCALES)[number];
