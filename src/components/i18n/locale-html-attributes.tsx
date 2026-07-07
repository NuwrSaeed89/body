"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";

/** Keeps document lang in sync when html/body live in the root layout. */
export function LocaleHtmlAttributes() {
  const locale = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
