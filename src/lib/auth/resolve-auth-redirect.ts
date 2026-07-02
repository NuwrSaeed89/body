import { routing } from "@/i18n/routing";

/** Ensures locale-prefixed paths for auth callbacks (e.g. `/account` → `/en/account`). */
export function resolveAuthRedirectPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const hasLocale = routing.locales.some(
    (locale) => normalized === `/${locale}` || normalized.startsWith(`/${locale}/`),
  );
  if (hasLocale) return normalized;
  return `/${routing.defaultLocale}${normalized}`;
}
