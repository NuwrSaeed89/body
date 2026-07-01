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
import { useLocale } from "next-intl";
import {
  CURRENCY_COOKIE,
  CURRENCY_STORAGE_KEY,
  DEFAULT_CURRENCY,
  formatPriceFromSek,
  isCurrency,
  parseCurrency,
  type Currency,
} from "@/lib/currency";

type CurrencyContextValue = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatFromSek: (amountSek: number) => string;
  mounted: boolean;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function persistCurrency(currency: Currency) {
  window.localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
  document.cookie = `${CURRENCY_COOKIE}=${currency};path=/;max-age=31536000;sameSite=lax`;
  window.dispatchEvent(new CustomEvent("mbody-currency-change", { detail: currency }));
}

type CurrencyProviderProps = {
  children: ReactNode;
  initialCurrency?: Currency;
};

export function CurrencyProvider({ children, initialCurrency }: CurrencyProviderProps) {
  const locale = useLocale();
  const [currency, setCurrencyState] = useState<Currency>(
    initialCurrency ?? DEFAULT_CURRENCY,
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = parseCurrency(window.localStorage.getItem(CURRENCY_STORAGE_KEY));
    if (saved !== (initialCurrency ?? DEFAULT_CURRENCY)) {
      setCurrencyState(saved);
    }
    setMounted(true);
  }, [initialCurrency]);

  const setCurrency = useCallback((next: Currency) => {
    setCurrencyState(next);
    persistCurrency(next);
  }, []);

  const formatFromSek = useCallback(
    (amountSek: number) => formatPriceFromSek(amountSek, currency, locale),
    [currency, locale],
  );

  const value = useMemo(
    () => ({ currency, setCurrency, formatFromSek, mounted }),
    [currency, setCurrency, formatFromSek, mounted],
  );

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return context;
}
