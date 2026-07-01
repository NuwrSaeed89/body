"use client";

import { useEffect, useRef, useState } from "react";
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
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const switchLocale = (next: Locale) => {
    setOpen(false);
    router.replace(pathname, { locale: next });
  };

  const wrapperClass = mobile
    ? "relative z-[70]"
    : "relative z-[70] hidden md:block";

  const triggerTextClass = mobile
    ? "text-on-surface-variant"
    : isDark
      ? "text-white/70 hover:text-white"
      : "text-on-surface-variant hover:text-primary";

  return (
    <div ref={rootRef} className={wrapperClass}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.08em] transition-colors ${triggerTextClass}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Change language"
      >
        {localeLabels[locale]}
        <span className="material-symbols-outlined text-[14px]">expand_more</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-[calc(100%+6px)] z-[70] min-w-[88px] overflow-hidden rounded-md border border-outline-variant/40 bg-background shadow-[0_10px_30px_rgba(18,18,18,0.12)]"
        >
          {locales.map((code) => (
            <button
              key={code}
              type="button"
              role="menuitem"
              onClick={() => switchLocale(code)}
              className={`block w-full px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.08em] transition-colors ${
                code === locale
                  ? "bg-surface-container-low text-primary"
                  : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
              }`}
              aria-current={code === locale ? "true" : undefined}
            >
              {localeLabels[code]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
