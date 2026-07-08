export const COLOR_LOCALES = ["en", "sv", "es", "de"] as const;

export type ColorLocale = (typeof COLOR_LOCALES)[number];
