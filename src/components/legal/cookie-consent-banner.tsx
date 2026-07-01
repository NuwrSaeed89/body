"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "@/i18n/navigation";
import { LEGAL_PATHS } from "@/lib/legal-pages";
import { useCookieConsent } from "@/providers/cookie-consent-provider";

function PreferenceToggle({
  title,
  description,
  checked,
  disabled,
  onChange,
  alwaysActiveLabel,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
  alwaysActiveLabel?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-outline-variant/20 py-4 last:border-b-0">
      <div>
        <p className="text-sm font-medium text-primary">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-secondary">{description}</p>
        {disabled && alwaysActiveLabel && (
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
            {alwaysActiveLabel}
          </p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative mt-1 h-6 w-11 shrink-0 rounded-full transition-colors ${
          disabled
            ? "cursor-not-allowed bg-primary"
            : checked
              ? "bg-primary"
              : "bg-outline-variant/50"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

export function CookieConsentBanner() {
  const t = useTranslations("cookieConsent");
  const {
    bannerVisible,
    preferencesOpen,
    draftPreferences,
    acceptAll,
    rejectNonEssential,
    openPreferences,
    closePreferences,
    setDraftPreference,
    savePreferences,
  } = useCookieConsent();
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  if (!portalReady || !bannerVisible) return null;

  return createPortal(
    <div
      className="fixed inset-x-0 bottom-0 z-[300] border-t border-outline-variant/20 bg-surface shadow-[0_-8px_32px_rgba(0,0,0,0.08)] md:bottom-0"
      role="dialog"
      aria-label={t("ariaLabel")}
      aria-modal="false"
    >
      <div className="mx-auto max-w-[1440px] px-5 py-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:px-16 md:py-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-8">
          <div className="max-w-3xl">
            <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-primary">
              {t("title")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-secondary">{t("description")}</p>
            <Link
              href={`${LEGAL_PATHS.privacy}#privacy-cookies`}
              className="mt-3 inline-block text-xs font-semibold uppercase tracking-wider text-primary underline decoration-outline-variant underline-offset-4"
            >
              {t("learnMore")}
            </Link>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            <button
              type="button"
              onClick={rejectNonEssential}
              className="rounded-lg border border-outline-variant px-5 py-3 text-xs font-semibold uppercase tracking-wider text-primary transition-colors hover:bg-surface-container-low"
            >
              {t("rejectNonEssential")}
            </button>
            {!preferencesOpen ? (
              <button
                type="button"
                onClick={openPreferences}
                className="rounded-lg border border-outline-variant px-5 py-3 text-xs font-semibold uppercase tracking-wider text-primary transition-colors hover:bg-surface-container-low"
              >
                {t("customize")}
              </button>
            ) : (
              <button
                type="button"
                onClick={closePreferences}
                className="rounded-lg border border-outline-variant px-5 py-3 text-xs font-semibold uppercase tracking-wider text-primary transition-colors hover:bg-surface-container-low"
              >
                {t("closePreferences")}
              </button>
            )}
            <button
              type="button"
              onClick={acceptAll}
              className="rounded-lg bg-primary px-5 py-3 text-xs font-semibold uppercase tracking-wider text-on-primary transition-opacity hover:opacity-90"
            >
              {t("acceptAll")}
            </button>
          </div>
        </div>

        {preferencesOpen && (
          <div className="mt-5 border-t border-outline-variant/20 pt-2">
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">
              {t("preferencesTitle")}
            </h3>
            <PreferenceToggle
              title={t("essential.title")}
              description={t("essential.description")}
              checked
              disabled
              alwaysActiveLabel={t("alwaysActive")}
            />
            <PreferenceToggle
              title={t("analytics.title")}
              description={t("analytics.description")}
              checked={draftPreferences.analytics}
              onChange={(value) => setDraftPreference("analytics", value)}
            />
            <PreferenceToggle
              title={t("marketing.title")}
              description={t("marketing.description")}
              checked={draftPreferences.marketing}
              onChange={(value) => setDraftPreference("marketing", value)}
            />
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={savePreferences}
                className="rounded-lg bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-wider text-on-primary transition-opacity hover:opacity-90"
              >
                {t("savePreferences")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
