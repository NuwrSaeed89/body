import { locales, type Locale } from "@/i18n/routing";
import { publicEnv } from "@/lib/env";

const OG_LOCALE: Record<Locale, string> = {
  en: "en_US",
  sv: "sv_SE",
  es: "es_ES",
  de: "de_DE",
};

export function getSiteOrigin(): string {
  return publicEnv.appUrl.replace(/\/$/, "");
}

/** Absolute path with locale prefix, e.g. /en/shop/slug */
export function localizedPath(locale: string, path = ""): string {
  const normalized = path.startsWith("/") ? path : path ? `/${path}` : "";
  return `/${locale}${normalized}`;
}

export function absoluteUrl(locale: string, path = ""): string {
  return `${getSiteOrigin()}${localizedPath(locale, path)}`;
}

export function openGraphLocale(locale: string): string {
  return OG_LOCALE[(locale as Locale) in OG_LOCALE ? (locale as Locale) : "en"];
}

/** hreflang map for a path relative to locale root (e.g. "/shop" or "/shop/slug") */
export function languageAlternates(path = ""): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = absoluteUrl(locale, path);
  }
  languages["x-default"] = absoluteUrl("en", path);
  return languages;
}
