"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CookieConsentBanner } from "@/components/legal/cookie-consent-banner";
import {
  acceptAllPreferences,
  buildConsentState,
  persistConsent,
  readStoredConsent,
  rejectNonEssentialPreferences,
  shouldShowConsentBanner,
  type CookieConsentPreferences,
  type CookieConsentState,
} from "@/lib/cookie-consent";

type CookieConsentContextValue = {
  consent: CookieConsentState | null;
  mounted: boolean;
  bannerVisible: boolean;
  preferencesOpen: boolean;
  draftPreferences: CookieConsentPreferences;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  openPreferences: () => void;
  closePreferences: () => void;
  setDraftPreference: (category: keyof CookieConsentPreferences, value: boolean) => void;
  savePreferences: () => void;
};

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

type CookieConsentProviderProps = {
  children: ReactNode;
};

export function CookieConsentProvider({ children }: CookieConsentProviderProps) {
  const [consent, setConsent] = useState<CookieConsentState | null>(null);
  const [mounted, setMounted] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [draftPreferences, setDraftPreferences] = useState<CookieConsentPreferences>(
    rejectNonEssentialPreferences(),
  );

  useEffect(() => {
    const stored = readStoredConsent();
    setConsent(stored);
    if (stored) {
      setDraftPreferences(stored.preferences);
    }
    setMounted(true);
  }, []);

  const applyConsent = useCallback((preferences: CookieConsentPreferences) => {
    const next = buildConsentState(preferences);
    persistConsent(next);
    setConsent(next);
    setDraftPreferences(preferences);
    setPreferencesOpen(false);
  }, []);

  const acceptAll = useCallback(() => {
    applyConsent(acceptAllPreferences());
  }, [applyConsent]);

  const rejectNonEssential = useCallback(() => {
    applyConsent(rejectNonEssentialPreferences());
  }, [applyConsent]);

  const openPreferences = useCallback(() => {
    setDraftPreferences(consent?.preferences ?? rejectNonEssentialPreferences());
    setPreferencesOpen(true);
  }, [consent]);

  const closePreferences = useCallback(() => {
    setPreferencesOpen(false);
    setDraftPreferences(consent?.preferences ?? rejectNonEssentialPreferences());
  }, [consent]);

  const setDraftPreference = useCallback(
    (category: keyof CookieConsentPreferences, value: boolean) => {
      setDraftPreferences((current) => ({ ...current, [category]: value }));
    },
    [],
  );

  const savePreferences = useCallback(() => {
    applyConsent(draftPreferences);
  }, [applyConsent, draftPreferences]);

  const bannerVisible = mounted && shouldShowConsentBanner(consent);

  const value = useMemo(
    () => ({
      consent,
      mounted,
      bannerVisible,
      preferencesOpen,
      draftPreferences,
      acceptAll,
      rejectNonEssential,
      openPreferences,
      closePreferences,
      setDraftPreference,
      savePreferences,
    }),
    [
      consent,
      mounted,
      bannerVisible,
      preferencesOpen,
      draftPreferences,
      acceptAll,
      rejectNonEssential,
      openPreferences,
      closePreferences,
      setDraftPreference,
      savePreferences,
    ],
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
      <CookieConsentBanner />
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error("useCookieConsent must be used within CookieConsentProvider");
  }
  return context;
}
