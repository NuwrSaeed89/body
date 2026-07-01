"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { CartShippingNotice } from "@/components/cart/cart-shipping-notice";
import {
  DESKTOP_CART_ITEMS,
  DESKTOP_CROSS_SELL,
  MOBILE_CART_ITEMS,
  MOBILE_CROSS_SELL,
  type CartLineItem,
  type CrossSellItem,
} from "@/lib/cart-data";
import { calculateCartSummary } from "@/lib/currency";
import { useCurrency } from "@/providers/currency-provider";

type Quantities = Record<string, number>;

function QuantityControl({
  quantity,
  onDecrease,
  onIncrease,
  variant,
}: {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  variant: "desktop" | "mobile";
}) {
  const isDesktop = variant === "desktop";

  return (
    <div
      className={
        isDesktop
          ? "flex items-center rounded-full border border-outline/20 bg-surface-container-lowest px-4 py-2"
          : "flex items-center rounded-full border border-outline-variant bg-white px-3 py-1"
      }
    >
      <button
        type="button"
        onClick={onDecrease}
        className={`transition-opacity hover:opacity-50 ${isDesktop ? "" : "p-1 text-primary"}`}
        aria-label="Decrease quantity"
      >
        <span className={`material-symbols-outlined ${isDesktop ? "text-xs" : "text-sm"}`}>
          remove
        </span>
      </button>
      <span
        className={
          isDesktop
            ? "mx-6 text-xs font-semibold uppercase tracking-widest"
            : "mx-3 text-sm"
        }
      >
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrease}
        className={`transition-opacity hover:opacity-50 ${isDesktop ? "" : "p-1 text-primary"}`}
        aria-label="Increase quantity"
      >
        <span className={`material-symbols-outlined ${isDesktop ? "text-xs" : "text-sm"}`}>
          add
        </span>
      </button>
    </div>
  );
}

function CartItemRow({
  item,
  quantity,
  variant,
  onDecrease,
  onIncrease,
  onRemove,
}: {
  item: CartLineItem;
  quantity: number;
  variant: "desktop" | "mobile";
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
}) {
  const t = useTranslations("cart");
  const { formatFromSek } = useCurrency();
  const isDesktop = variant === "desktop";
  const unitPriceSek = item.priceSek;

  if (isDesktop) {
    return (
      <div className="group flex flex-col gap-8 border-b border-surface-variant pb-12 md:flex-row">
        <div className="aspect-[4/5] w-full overflow-hidden rounded-lg bg-surface-container-low md:w-48">
          <Image
            src={item.image}
            alt={item.imageAlt}
            width={192}
            height={240}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-1 flex-col">
          <div className="mb-2 flex items-start justify-between">
            <div>
              <h3 className="mb-1 text-lg font-semibold tracking-wide text-primary">
                {t(`items.${item.id}.name`)}
              </h3>
              <p className="text-sm text-secondary">{t(`items.${item.id}.variant`)}</p>
            </div>
            <p className="text-lg font-semibold tracking-wide text-primary">
              {formatFromSek(unitPriceSek * quantity)}
            </p>
          </div>
          <div className="mt-auto flex items-center justify-between pt-8">
            <QuantityControl
              quantity={quantity}
              onDecrease={onDecrease}
              onIncrease={onIncrease}
              variant="desktop"
            />
            <button
              type="button"
              onClick={onRemove}
              className="flex items-center text-xs font-semibold uppercase tracking-widest text-secondary transition-colors hover:text-error"
            >
              {t("remove")}
              <span className="material-symbols-outlined ml-2 text-sm">close</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-start gap-4">
      <div className="aspect-[4/5] w-24 overflow-hidden rounded-lg bg-surface-container shadow-sm">
        <Image
          src={item.image}
          alt={item.imageAlt}
          width={96}
          height={120}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex h-full flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold tracking-wide">
              {t(`items.${item.id}.name`)}
            </h3>
            <p className="text-base">{formatFromSek(unitPriceSek)}</p>
          </div>
          <p className="mt-1 text-sm text-secondary">{t(`items.${item.id}.variant`)}</p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <QuantityControl
            quantity={quantity}
            onDecrease={onDecrease}
            onIncrease={onIncrease}
            variant="mobile"
          />
          <button
            type="button"
            onClick={onRemove}
            className="border-b border-secondary/20 pb-0.5 text-[10px] font-semibold uppercase tracking-widest text-secondary transition-colors hover:text-primary"
          >
            {t("remove")}
          </button>
        </div>
      </div>
    </div>
  );
}

function CrossSellCard({
  item,
  variant,
}: {
  item: CrossSellItem;
  variant: "desktop" | "mobile";
}) {
  const t = useTranslations("cart");
  const { formatFromSek } = useCurrency();

  if (variant === "desktop") {
    return (
      <div className="group cursor-pointer">
        <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-lg bg-surface-container-low">
          <Image
            src={item.image}
            alt={item.imageAlt}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          {item.badgeKey && (
            <div className="absolute bottom-4 left-4">
              <span className="bg-surface-bright/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary backdrop-blur">
                {t(item.badgeKey)}
              </span>
            </div>
          )}
        </div>
        <h4 className="text-lg font-semibold tracking-wide text-primary underline-offset-4 group-hover:underline">
          {t(`crossSell.${item.id}.name`)}
        </h4>
        <p className="text-sm text-secondary">{formatFromSek(item.priceSek)}</p>
      </div>
    );
  }

  const categoryLabel = item.categoryKey ? t(item.categoryKey) : t("newArrival");

  return (
    <div className="flex min-w-[180px] snap-start flex-col gap-3 group">
      <div className="aspect-[4/5] overflow-hidden rounded-lg bg-surface-container shadow-sm">
        <Image
          src={item.image}
          alt={item.imageAlt}
          width={180}
          height={225}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
          {categoryLabel}
        </p>
        <h4 className="text-sm font-medium">{t(`crossSell.${item.id}.name`)}</h4>
        <p className="text-sm text-secondary">{formatFromSek(item.priceSek)}</p>
      </div>
      <button
        type="button"
        className="w-full rounded-full border border-primary py-2 text-[10px] font-semibold uppercase text-primary transition-all hover:bg-primary hover:text-white"
      >
        {t("addToBag")}
      </button>
    </div>
  );
}

function useCartTotals(items: CartLineItem[], quantities: Quantities) {
  return useMemo(() => {
    const activeItems = items.filter((item) => (quantities[item.id] ?? 0) > 0);
    const subtotalSek = activeItems.reduce(
      (sum, item) => sum + item.priceSek * (quantities[item.id] ?? 0),
      0,
    );
    const totalQty = activeItems.reduce(
      (sum, item) => sum + (quantities[item.id] ?? 0),
      0,
    );
    return { subtotalSek, count: totalQty };
  }, [items, quantities]);
}

type CartFilledContentProps = {
  variant: "desktop" | "mobile";
  quantities: Quantities;
  setQuantities: (next: Quantities) => void;
};

export function CartFilledContent({
  variant,
  quantities,
  setQuantities,
}: CartFilledContentProps) {
  const t = useTranslations("cart");
  const { currency, formatFromSek } = useCurrency();
  const locale = useLocale();

  const items = variant === "desktop" ? DESKTOP_CART_ITEMS : MOBILE_CART_ITEMS;
  const { subtotalSek, count } = useCartTotals(items, quantities);
  const summary = useMemo(
    () => calculateCartSummary(subtotalSek, currency, locale),
    [subtotalSek, currency, locale],
  );
  const isDesktop = variant === "desktop";

  const updateQty = (id: string, delta: number) => {
    setQuantities({
      ...quantities,
      [id]: Math.max(0, (quantities[id] ?? 0) + delta),
    });
  };

  const klarnaAmount = formatFromSek(summary.grandTotalSek / 4);

  return (
    <>
      <div
        className={`mx-auto max-w-[1440px] ${
          isDesktop ? "min-h-screen px-5 py-12 md:px-16 md:py-20" : "pb-64"
        }`}
      >
        {isDesktop ? (
          <>
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
                {items.map((item) =>
                  (quantities[item.id] ?? 0) > 0 ? (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      quantity={quantities[item.id]}
                      variant="desktop"
                      onDecrease={() => updateQty(item.id, -1)}
                      onIncrease={() => updateQty(item.id, 1)}
                      onRemove={() =>
                        setQuantities({ ...quantities, [item.id]: 0 })
                      }
                    />
                  ) : null,
                )}

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
                      <span className="text-2xl font-medium text-primary">
                        {summary.grandTotal}
                      </span>
                      <p className="text-sm text-secondary">
                        {t("klarna", { amount: klarnaAmount })}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4 pt-4">
                    <Link
                      href="/checkout/shipping"
                      className="block w-full rounded-lg bg-primary py-5 text-center text-xs font-semibold uppercase tracking-[0.2em] text-on-primary transition-all hover:bg-on-primary-container active:scale-[0.98]"
                    >
                      {t("proceedToCheckout")}
                    </Link>
                    <button
                      type="button"
                      className="w-full rounded-lg border border-outline/20 py-5 text-xs font-semibold uppercase tracking-[0.2em] text-primary transition-all hover:bg-surface-container-low"
                    >
                      {t("payWithPaypal")}
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-4 pt-4 opacity-40 grayscale">
                    <span className="material-symbols-outlined text-2xl">credit_card</span>
                    <span className="material-symbols-outlined text-2xl">lock</span>
                    <span className="material-symbols-outlined text-2xl">verified_user</span>
                  </div>
                </div>
              </div>
            </div>

            <section className="mt-32 border-t border-surface-variant pt-20">
              <h2 className="mb-12 text-2xl font-medium text-primary">{t("youMightAlsoLike")}</h2>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {DESKTOP_CROSS_SELL.map((item) => (
                  <CrossSellCard key={item.id} item={item} variant="desktop" />
                ))}
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="px-5 py-6">
              <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest opacity-60">
                {t("selection", { count })}
              </h2>
              <div className="flex flex-col gap-8">
                {items.map((item) =>
                  (quantities[item.id] ?? 0) > 0 ? (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      quantity={quantities[item.id]}
                      variant="mobile"
                      onDecrease={() => updateQty(item.id, -1)}
                      onIncrease={() => updateQty(item.id, 1)}
                      onRemove={() =>
                        setQuantities({ ...quantities, [item.id]: 0 })
                      }
                    />
                  ) : null,
                )}
              </div>
            </section>

            <section className="mt-8 bg-surface-container-low py-10">
              <div className="px-5">
                <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest">
                  {t("summary")}
                </h2>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary">{t("subtotal")}</span>
                    <span>{summary.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary">{t("shipping")}</span>
                    <span>{summary.freeShipping ? t("free") : summary.shipping}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary">{t("vat")}</span>
                    <span>{summary.vat}</span>
                  </div>
                  <div className="my-2 h-px bg-outline-variant/30" />
                  <div className="flex justify-between text-2xl font-medium">
                    <span>{t("total")}</span>
                    <span>{summary.grandTotal}</span>
                  </div>
                  {!summary.freeShipping && (
                    <p className="text-xs text-secondary">
                      {t("shippingNoticeBodyProgress", {
                        amount: summary.amountUntilFreeShipping,
                        threshold: summary.freeShippingThreshold,
                      })}
                    </p>
                  )}
                </div>
                <div className="mt-8">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t("promoCode")}
                      className="w-full border-b border-outline-variant bg-transparent px-1 py-3 text-sm outline-none transition-colors focus:border-primary"
                    />
                    <button
                      type="button"
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase text-primary"
                    >
                      {t("apply")}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-surface py-12">
              <div className="mb-6 px-5">
                <h2 className="text-xs font-semibold uppercase tracking-widest opacity-60">
                  {t("essentialAdditions")}
                </h2>
                <h3 className="mt-1 text-2xl font-medium">{t("completeTheLook")}</h3>
              </div>
              <div className="hide-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto px-5">
                {MOBILE_CROSS_SELL.map((item) => (
                  <CrossSellCard key={item.id} item={item} variant="mobile" />
                ))}
              </div>
            </section>

            <footer className="border-t border-outline-variant/10 bg-surface-container-low px-5 py-12">
              <div className="flex flex-col items-center gap-4">
                <p className="text-sm italic text-secondary opacity-60">
                  {t("mobileFooterTagline")}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-secondary">
                  {t("mobileFooterCopyright")}
                </p>
              </div>
            </footer>
          </>
        )}
      </div>

      {!isDesktop && (
        <div className="fixed bottom-[var(--mobile-nav-height)] left-0 right-0 z-[60] md:hidden">
          <div className="border-t border-outline-variant/10 bg-surface/95 px-5 pb-4 pt-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-secondary">{t("estimatedDelivery")}</span>
              <span className="text-lg font-semibold tracking-wide">{summary.grandTotal}</span>
            </div>
            <Link
              href="/checkout/shipping"
              className="block w-full rounded-lg bg-primary py-4 text-center text-xs font-semibold uppercase tracking-widest text-on-primary shadow-lg transition-all active:scale-[0.98]"
            >
              {t("proceedToCheckout")}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
