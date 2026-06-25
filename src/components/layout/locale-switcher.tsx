"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";

const localeLabels: Record<Locale, string> = {
  en: "EN",
  sv: "SV",
  es: "ES",
  de: "DE",
};

type LocaleSwitcherProps = {
  variant?: "light" | "dark";
  mobile?: boolean;
};

export function LocaleSwitcher({ variant = "light", mobile = false }: LocaleSwitcherProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const isDark = variant === "dark";

  const cycleLocale = () => {
    const index = locales.indexOf(locale);
    const next = locales[(index + 1) % locales.length];
    router.replace(pathname, { locale: next });
  };

  if (mobile) {
    return (
      <button
        type="button"
        onClick={cycleLocale}
        className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-on-surface-variant"
      >
        {localeLabels[locale]}
        <span className="material-symbols-outlined text-[14px]">expand_more</span>
      </button>
    );
  }

  return (
    <div className="hidden items-center gap-1 text-xs font-semibold uppercase tracking-[0.08em] md:flex">
      {locales.map((code, index) => (
        <span key={code} className="flex items-center gap-1">
          {index > 0 && (
            <span
              className={isDark ? "text-white/30" : "text-outline-variant"}
              aria-hidden
            >
              |
            </span>
          )}
          <button
            type="button"
            onClick={() => router.replace(pathname, { locale: code })}
            className={
              code === locale
                ? isDark
                  ? "text-white"
                  : "text-primary"
                : isDark
                  ? "text-white/70 hover:text-white"
                  : "text-secondary hover:text-primary"
            }
            aria-current={code === locale ? "true" : undefined}
          >
            {localeLabels[code]}
          </button>
        </span>
      ))}
    </div>
  );
}
