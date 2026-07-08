"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { CartShippingNotice } from "@/components/cart/cart-shipping-notice";
import type { CartItem } from "@/lib/cart/types";
import { calculateCartSummary } from "@/lib/currency";
import { useCart } from "@/providers/cart-provider";
import { useCurrency } from "@/providers/currency-provider";

type CartLiveContentProps = {
  items: CartItem[];
};

function QuantityControl({
  quantity,
  disabled,
  onDecrease,
  onIncrease,
}: {
  quantity: number;
  disabled?: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <div className="flex items-center rounded-full border border-outline/20 bg-surface-container-lowest px-4 py-2">
      <button
        type="button"
        onClick={onDecrease}
        disabled={disabled}
        className="transition-opacity hover:opacity-50 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Decrease quantity"
      >
        <span className="material-symbols-outlined text-xs">remove</span>
      </button>
      <span className="mx-6 text-xs font-semibold uppercase tracking-widest">{quantity}</span>
      <button
        type="button"
        onClick={onIncrease}
        disabled={disabled}
        className="transition-opacity hover:opacity-50 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Increase quantity"
      >
        <span className="material-symbols-outlined text-xs">add</span>
      </button>
    </div>
  );
}

function LiveCartItemRow({
  item,
  exiting,
  pending,
  onDecrease,
  onIncrease,
  onRemove,
  onExitComplete,
}: {
  item: CartItem;
  exiting: boolean;
  pending: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
  onExitComplete: () => void;
}) {
  const t = useTranslations("cart");
  const { formatFromSek } = useCurrency();

  return (
    <div
      className={`group flex flex-col gap-8 border-b border-surface-variant pb-12 md:flex-row ${
        exiting ? "cart-item-exit" : ""
      }`}
      onAnimationEnd={(event) => {
        if (event.animationName === "cartItemExit") {
          onExitComplete();
        }
      }}
    >
      <Link
        href={`/shop/${item.productSlug}`}
        className="aspect-[4/5] w-full overflow-hidden rounded-lg bg-surface-container-low md:w-48"
        tabIndex={exiting ? -1 : undefined}
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
              tabIndex={exiting ? -1 : undefined}
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
        <div className="mt-auto flex items-center justify-between pt-8">
          <QuantityControl
            quantity={item.quantity}
            disabled={pending || exiting}
            onDecrease={onDecrease}
            onIncrease={onIncrease}
          />
          <button
            type="button"
            onClick={onRemove}
            disabled={pending || exiting}
            className="flex items-center text-xs font-semibold uppercase tracking-widest text-secondary transition-colors hover:text-error disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("remove")}
            <span className="material-symbols-outlined ml-2 text-sm">close</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function CartLiveContent({ items }: CartLiveContentProps) {
  const t = useTranslations("cart");
  const { currency, formatFromSek } = useCurrency();
  const locale = useLocale();
  const { updateItemQuantity, removeItem, isGuestCart } = useCart();
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [exitingItemIds, setExitingItemIds] = useState<Set<string>>(() => new Set());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const subtotalSek = useMemo(
    () =>
      items
        .filter((item) => !exitingItemIds.has(item.id))
        .reduce((sum, item) => sum + item.priceSek * item.quantity, 0),
    [items, exitingItemIds],
  );
  const count = useMemo(
    () =>
      items
        .filter((item) => !exitingItemIds.has(item.id))
        .reduce((sum, item) => sum + item.quantity, 0),
    [items, exitingItemIds],
  );
  const summary = useMemo(
    () => calculateCartSummary(subtotalSek, currency, locale),
    [subtotalSek, currency, locale],
  );
  const klarnaAmount = formatFromSek(summary.grandTotalSek / 4);
  const summaryUpdating = pendingItemId !== null;

  const handleMutation = async (
    itemId: string,
    action: () => Promise<{ ok: boolean; error?: string }>,
  ) => {
    setErrorMessage(null);
    setPendingItemId(itemId);
    const result = await action();
    setPendingItemId(null);

    if (!result.ok) {
      setExitingItemIds((current) => {
        const next = new Set(current);
        next.delete(itemId);
        return next;
      });
      if (result.error === "out_of_stock") {
        setErrorMessage(t("outOfStock"));
      } else {
        setErrorMessage(t("updateError"));
      }
    }

    return result;
  };

  const beginRemove = (itemId: string) => {
    if (exitingItemIds.has(itemId) || pendingItemId === itemId) return;
    setExitingItemIds((current) => new Set(current).add(itemId));
  };

  const completeRemove = (itemId: string) => {
    if (!exitingItemIds.has(itemId)) return;
    void handleMutation(itemId, () => removeItem(itemId)).then((result) => {
      if (result?.ok) {
        setExitingItemIds((current) => {
          const next = new Set(current);
          next.delete(itemId);
          return next;
        });
      }
    });
  };

  return (
    <div className="mx-auto min-h-screen max-w-[1440px] px-5 py-12 md:px-16 md:py-20">
      <div className="mb-12">
        <h1 className="mb-4 text-3xl font-medium tracking-tight text-primary md:text-5xl">
          {t("title")}
        </h1>
        <p
          className={`text-xs font-semibold uppercase tracking-widest text-secondary cart-summary-value ${
            summaryUpdating ? "cart-summary-value-updating" : ""
          }`}
        >
          {t("itemsTotal", { count })}
        </p>
        {errorMessage ? (
          <p className="mt-4 text-sm text-error" role="alert">
            {errorMessage}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-24">
        <div className="space-y-12 lg:col-span-8">
          {items.map((item) => {
            const exiting = exitingItemIds.has(item.id);
            return (
              <LiveCartItemRow
                key={item.id}
                item={item}
                exiting={exiting}
                pending={pendingItemId === item.id}
                onDecrease={() => {
                  const nextQuantity = item.quantity - 1;
                  if (nextQuantity <= 0) {
                    beginRemove(item.id);
                    return;
                  }
                  void handleMutation(item.id, () =>
                    updateItemQuantity(item.id, nextQuantity),
                  );
                }}
                onIncrease={() => {
                  void handleMutation(item.id, () =>
                    updateItemQuantity(item.id, item.quantity + 1),
                  );
                }}
                onRemove={() => beginRemove(item.id)}
                onExitComplete={() => completeRemove(item.id)}
              />
            );
          })}

          <CartShippingNotice summary={summary} />
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-32 space-y-8 rounded-xl bg-surface-container-lowest p-10 luxury-shadow">
            <h2 className="border-b border-surface-variant pb-4 text-2xl font-medium text-primary">
              {t("orderSummary")}
            </h2>
            <div
              className={`space-y-4 cart-summary-value ${
                summaryUpdating ? "cart-summary-value-updating" : ""
              }`}
            >
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
            <div
              className={`flex items-end justify-between border-t border-surface-variant pt-6 cart-summary-value ${
                summaryUpdating ? "cart-summary-value-updating" : ""
              }`}
            >
              <span className="text-2xl font-medium text-primary">{t("total")}</span>
              <div className="text-right">
                <span className="text-2xl font-medium text-primary">{summary.grandTotal}</span>
                <p className="text-sm text-secondary">{t("klarna", { amount: klarnaAmount })}</p>
              </div>
            </div>
            <Link
              href={isGuestCart ? "/account/login" : "/checkout/shipping"}
              className="block w-full rounded-lg bg-primary py-5 text-center text-xs font-semibold uppercase tracking-[0.2em] text-on-primary transition-all hover:bg-on-primary-container active:scale-[0.98]"
            >
              {isGuestCart ? t("signInToCheckout") : t("proceedToCheckout")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
