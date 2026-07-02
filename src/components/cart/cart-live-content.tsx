"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { CartShippingNotice } from "@/components/cart/cart-shipping-notice";
import type { CartItem } from "@/lib/cart/types";
import { calculateCartSummary } from "@/lib/currency";
import { useCurrency } from "@/providers/currency-provider";

type CartLiveContentProps = {
  items: CartItem[];
};

export function CartLiveContent({ items }: CartLiveContentProps) {
  const t = useTranslations("cart");
  const { currency, formatFromSek } = useCurrency();
  const locale = useLocale();

  const subtotalSek = useMemo(
    () => items.reduce((sum, item) => sum + item.priceSek * item.quantity, 0),
    [items],
  );
  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );
  const summary = useMemo(
    () => calculateCartSummary(subtotalSek, currency, locale),
    [subtotalSek, currency, locale],
  );
  const klarnaAmount = formatFromSek(summary.grandTotalSek / 4);

  return (
    <div className="mx-auto min-h-screen max-w-[1440px] px-5 py-12 md:px-16 md:py-20">
      <div className="mb-12">
        <h1 className="mb-4 text-3xl font-medium tracking-tight text-primary md:text-5xl">
          {t("title")}
        </h1>
        <p className="text-xs font-semibold uppercase tracking-widest text-secondary">
          {t("itemsTotal", { count })}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-24">
        <div className="space-y-12 lg:col-span-8">
          {items.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col gap-8 border-b border-surface-variant pb-12 md:flex-row"
            >
              <Link
                href={`/shop/${item.productSlug}`}
                className="aspect-[4/5] w-full overflow-hidden rounded-lg bg-surface-container-low md:w-48"
              >
                <Image
                  src={item.image}
                  alt={item.imageAlt}
                  width={192}
                  height={240}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="mb-2 flex items-start justify-between gap-4">
                  <div>
                    <Link
                      href={`/shop/${item.productSlug}`}
                      className="mb-1 text-lg font-semibold tracking-wide text-primary hover:underline"
                    >
                      {item.productName}
                    </Link>
                    <p className="text-sm text-secondary">
                      {[item.colorName, item.size].filter(Boolean).join(" / ")}
                    </p>
                  </div>
                  <p className="text-lg font-semibold tracking-wide text-primary">
                    {formatFromSek(item.priceSek * item.quantity)}
                  </p>
                </div>
                <p className="mt-auto text-xs font-semibold uppercase tracking-widest text-secondary">
                  {t("quantity")}: {item.quantity}
                </p>
              </div>
            </div>
          ))}

          <CartShippingNotice summary={summary} />
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-32 space-y-8 rounded-xl bg-surface-container-lowest p-10 luxury-shadow">
            <h2 className="border-b border-surface-variant pb-4 text-2xl font-medium text-primary">
              {t("orderSummary")}
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between text-base text-secondary">
                <span>{t("subtotal")}</span>
                <span>{summary.subtotal}</span>
              </div>
              <div className="flex justify-between text-base text-secondary">
                <span>{t("shipping")}</span>
                <span
                  className={
                    summary.freeShipping
                      ? "text-xs font-medium uppercase tracking-widest text-on-surface"
                      : ""
                  }
                >
                  {summary.freeShipping ? t("free") : summary.shipping}
                </span>
              </div>
              <div className="flex justify-between text-base text-secondary">
                <span>{t("estimatedTax")}</span>
                <span>{summary.vat}</span>
              </div>
            </div>
            <div className="flex items-end justify-between border-t border-surface-variant pt-6">
              <span className="text-2xl font-medium text-primary">{t("total")}</span>
              <div className="text-right">
                <span className="text-2xl font-medium text-primary">{summary.grandTotal}</span>
                <p className="text-sm text-secondary">{t("klarna", { amount: klarnaAmount })}</p>
              </div>
            </div>
            <Link
              href="/checkout/shipping"
              className="block w-full rounded-lg bg-primary py-5 text-center text-xs font-semibold uppercase tracking-[0.2em] text-on-primary transition-all hover:bg-on-primary-container active:scale-[0.98]"
            >
              {t("proceedToCheckout")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
