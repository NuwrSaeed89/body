export const COOKIE_CONSENT_STORAGE_KEY = "mbody-cookie-consent";
export const COOKIE_CONSENT_VERSION = 1;
export const COOKIE_CONSENT_CHANGE_EVENT = "mbody-cookie-consent-change";

export type CookieCategory = "analytics" | "marketing";

export type CookieConsentPreferences = {
  analytics: boolean;
  marketing: boolean;
};

export type CookieConsentState = {
  version: number;
  essential: true;
  preferences: CookieConsentPreferences;
  updatedAt: string;
};

export function acceptAllPreferences(): CookieConsentPreferences {
  return { analytics: true, marketing: true };
}

export function rejectNonEssentialPreferences(): CookieConsentPreferences {
  return { analytics: false, marketing: false };
}

export function parseCookieConsent(raw: string | null): CookieConsentState | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<CookieConsentState>;
    if (parsed.version !== COOKIE_CONSENT_VERSION) return null;
    if (parsed.essential !== true) return null;
    if (!parsed.preferences || typeof parsed.preferences !== "object") return null;
    if (typeof parsed.preferences.analytics !== "boolean") return null;
    if (typeof parsed.preferences.marketing !== "boolean") return null;
    if (typeof parsed.updatedAt !== "string") return null;

    return {
      version: COOKIE_CONSENT_VERSION,
      essential: true,
      preferences: {
        analytics: parsed.preferences.analytics,
        marketing: parsed.preferences.marketing,
      },
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return null;
  }
}

export function buildConsentState(
  preferences: CookieConsentPreferences,
): CookieConsentState {
  return {
    version: COOKIE_CONSENT_VERSION,
    essential: true,
    preferences,
    updatedAt: new Date().toISOString(),
  };
}

export function shouldShowConsentBanner(consent: CookieConsentState | null): boolean {
  return consent === null;
}

export function hasAnalyticsConsent(consent: CookieConsentState | null): boolean {
  return consent?.preferences.analytics === true;
}

export function hasMarketingConsent(consent: CookieConsentState | null): boolean {
  return consent?.preferences.marketing === true;
}

export function readStoredConsent(): CookieConsentState | null {
  if (typeof window === "undefined") return null;
  return parseCookieConsent(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY));
}

export function persistConsent(state: CookieConsentState): void {
  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(
    new CustomEvent(COOKIE_CONSENT_CHANGE_EVENT, { detail: state }),
  );
}
