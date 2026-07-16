"use client";

import { useTranslations } from "next-intl";

type SmartSizeGuideBannerProps = {
  onOpen: () => void;
};

export function SmartSizeGuideBanner({ onOpen }: SmartSizeGuideBannerProps) {
  const t = useTranslations("sizeGuide");

  return (
    <section className="mt-2">
      <button
        type="button"
        onClick={onOpen}
        className="group relative flex h-40 w-full overflow-hidden rounded-2xl bg-surface-container text-left transition-shadow hover:shadow-md sm:h-48"
      >
        <span
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-surface-container-high via-surface-container-high/90 to-transparent z-10"
        />
        <span
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,rgba(138,122,74,0.18),transparent_55%)] opacity-80 transition-transform duration-700 group-hover:scale-105"
        />
        <span className="relative z-20 flex w-full flex-col items-start justify-center gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <span>
            <span className="block text-lg font-medium tracking-tight text-primary sm:text-xl">
              {t("banner.title")}
            </span>
            <span className="mt-1 block max-w-md text-sm text-secondary">{t("banner.description")}</span>
          </span>
          <span className="inline-flex whitespace-nowrap rounded-full bg-primary px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-on-primary transition-opacity group-hover:opacity-90">
            {t("banner.cta")}
          </span>
        </span>
      </button>
    </section>
  );
}
