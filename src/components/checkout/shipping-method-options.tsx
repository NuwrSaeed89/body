"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import {
  calculateCartSummary,
  EXPRESS_SHIPPING_FEE_SEK,
  type CartSummary,
} from "@/lib/currency";
import { useCurrency } from "@/providers/currency-provider";

const CHECKOUT_SUBTOTAL_SEK = 990 + 750;

type ShippingMethodOptionsProps = {
  subtotalSek?: number;
};

export function ShippingMethodOptions({
  subtotalSek = CHECKOUT_SUBTOTAL_SEK,
}: ShippingMethodOptionsProps) {
  const t = useTranslations("checkout.shipping");
  const { currency, formatFromSek } = useCurrency();
  const locale = useLocale();

  const summary: CartSummary = useMemo(
    () => calculateCartSummary(subtotalSek, currency, locale),
    [subtotalSek, currency, locale],
  );

  const standardLabel = summary.freeShipping ? t("free") : summary.shipping;
  const expressLabel = formatFromSek(EXPRESS_SHIPPING_FEE_SEK);

  return (
    <fieldset className="space-y-3">
      <legend className="mb-4 text-sm font-semibold uppercase tracking-[0.1em] text-primary">
        {t("delivery")}
      </legend>
      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-primary bg-surface-container-low p-4">
        <input type="radio" name="shipping" defaultChecked className="text-primary" />
        <div>
          <p className="text-sm font-medium">{t("standard")}</p>
          <p className="text-sm text-secondary">{t("standardEta")}</p>
        </div>
        <span
          className={`ml-auto text-sm font-medium ${
            summary.freeShipping ? "uppercase tracking-widest" : ""
          }`}
        >
          {standardLabel}
        </span>
      </label>
      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-outline-variant p-4">
        <input type="radio" name="shipping" className="text-primary" />
        <div>
          <p className="text-sm font-medium">{t("express")}</p>
          <p className="text-sm text-secondary">{t("expressEta")}</p>
        </div>
        <span className="ml-auto text-sm font-medium">{expressLabel}</span>
      </label>
      {!summary.freeShipping && (
        <p className="text-xs text-secondary">
          {t("freeShippingHint", { threshold: summary.freeShippingThreshold })}
        </p>
      )}
    </fieldset>
  );
}
