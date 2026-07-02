/** Fallback when a product has no uploaded media yet. */
export const CATALOG_IMAGE_PLACEHOLDER =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCzEQA-iy1d5qkRDPEgXv2zaN-rsbH53gs9bhijbcCoRRUWYFymm09wSZv-NChprTcCJknOzluGYvsaKEhI1I_ASSVccuxG2Ox0V-35Y7-6xKZ_Vr1uq1-0kq20Rp3-TmIiasfuMx9WB7-mxWBIXQm_4gEdvw2Ew2iKHQ620-2TkkK5oPCyxNpwihJYJi4EeFGvkJkJeLyUtR6QxnZX5tMAE-WaLa94KhQt7r1QfT9cQw3jIvf8AlQWMluenSgoXq1r1IR5v50p3hs";

export const SUPPORTED_CATALOG_LOCALES = ["en", "sv", "es", "de"] as const;

export function resolveCatalogLocale(locale: string): string {
  return SUPPORTED_CATALOG_LOCALES.includes(locale as (typeof SUPPORTED_CATALOG_LOCALES)[number])
    ? locale
    : "en";
}
