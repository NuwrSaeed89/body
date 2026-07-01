"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { FormattedPrice } from "@/components/ui/formatted-price";
import { calculateCartSummary } from "@/lib/currency";
import { useCurrency } from "@/providers/currency-provider";

const CHECKOUT_ITEMS = [
  { name: "Sculpt High-Rise Leggings", size: "S", qty: 1, priceSek: 990 },
  { name: "Elite Support Bra", size: "M", qty: 1, priceSek: 750 },
] as const;

export function OrderSummary() {
  const t = useTranslations("checkout.summary");
  const { currency } = useCurrency();
  const locale = useLocale();

  const subtotalSek = CHECKOUT_ITEMS.reduce((sum, item) => sum + item.priceSek, 0);
  const summary = useMemo(
    () => calculateCartSummary(subtotalSek, currency, locale),
    [subtotalSek, currency, locale],
  );

  return (
    <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-6">
      <h2 className="mb-6 text-sm font-semibold uppercase tracking-[0.1em] text-primary">
        {t("title")}
      </h2>

      <ul className="mb-6 space-y-4 border-b border-outline-variant/20 pb-6">
        {CHECKOUT_ITEMS.map((item) => (
          <li key={item.name} className="flex justify-between gap-4 text-sm">
            <div>
              <p className="font-medium text-on-surface">{item.name}</p>
              <p className="text-secondary">
                {t("size")}: {item.size} · {t("qty")}: {item.qty}
              </p>
            </div>
            <FormattedPrice amountSek={item.priceSek} className="shrink-0 text-on-surface" />
          </li>
        ))}
      </ul>

      <dl className="space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-secondary">{t("subtotal")}</dt>
          <dd>{summary.subtotal}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-secondary">{t("shipping")}</dt>
          <dd>{summary.freeShipping ? t("free") : summary.shipping}</dd>
        </div>
        <div className="flex justify-between border-t border-outline-variant/20 pt-3 text-base font-medium">
          <dt>{t("total")}</dt>
          <dd>{summary.grandTotal}</dd>
        </div>
      </dl>
    </div>
  );
}
