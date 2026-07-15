"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ProductEngagementBar } from "@/components/pdp/product-engagement-bar";
import { ProductRatingHeader } from "@/components/pdp/product-rating-header";
import { ProductRatingsSection } from "@/components/pdp/product-ratings-section";
import { FormattedPrice } from "@/components/ui/formatted-price";
import { NotifyWhenBackForm } from "@/components/stock-notify/notify-when-back-form";
import { WishlistToggleButton } from "@/components/wishlist/wishlist-toggle-button";
import type { ProductDetail } from "@/lib/shop-data";
import type { ProductRatingSummary } from "@/lib/product-ratings/types";
import { useAuth } from "@/providers/auth-provider";
import { useCart } from "@/providers/cart-provider";

type ProductPurchasePanelProps = {
  product: ProductDetail;
  initialRatingSummary?: ProductRatingSummary;
};

type DetailTab = "fabric" | "fit" | "care";

function findVariantStock(product: ProductDetail, size: string, colorName: string | null): number {
  const match = product.variants.find(
    (variant) =>
      variant.size === size && (!colorName || variant.colorName === colorName) && variant.isActive,
  );
  if (match) return match.stockQuantity;

  return product.variants
    .filter((variant) => variant.size === size && variant.isActive)
    .reduce((sum, variant) => sum + variant.stockQuantity, 0);
}

function findVariantId(product: ProductDetail, size: string, colorName: string | null): string | null {
  const match = product.variants.find(
    (variant) =>
      variant.size === size && (!colorName || variant.colorName === colorName) && variant.isActive,
  );
  return match?.id ?? null;
}

function useAddToBagFeedback() {
  const t = useTranslations("pdp");
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const handleAddToBag = async (variantId: string | null, quantity: number) => {
    if (!variantId) {
      setFeedback(t("cart.variantUnavailable"));
      return;
    }

    setAdding(true);
    setFeedback(null);

    const result = await addItem(variantId, Math.max(1, quantity));
    setAdding(false);

    if (result.ok) {
      setFeedback(t("cart.added"));
      return;
    }

    if (result.error === "not_signed_in") {
      setFeedback(t("cart.signInRequired"));
      return;
    }
    if (result.error === "profile_not_found") {
      setFeedback(t("cart.profileNotFound"));
      return;
    }
    if (result.error === "out_of_stock") {
      setFeedback(t("cart.outOfStock"));
      return;
    }
    if (result.error === "variant_not_found") {
      setFeedback(t("cart.variantUnavailable"));
      return;
    }

    setFeedback(t("cart.error"));
  };

  return { feedback, adding, handleAddToBag, isAuthenticated };
}

function formatCountdown(targetMs: number): string {
  const remaining = Math.max(0, targetMs - Date.now());
  const hours = Math.floor(remaining / 3_600_000)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((remaining % 3_600_000) / 60_000)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor((remaining % 60_000) / 1_000)
    .toString()
    .padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function ProductPurchasePanel({ product, initialRatingSummary }: ProductPurchasePanelProps) {
  const t = useTranslations("pdp");
  const tWishlist = useTranslations("wishlist");
  const [selectedSize, setSelectedSize] = useState(product.sizes[1] ?? product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wishlistFeedback, setWishlistFeedback] = useState<string | null>(null);
  const [tab, setTab] = useState<DetailTab>("fabric");
  const [timerText, setTimerText] = useState("03:00:00");
  const selectedColorName = product.colors[selectedColor]?.name ?? null;
  const { feedback, adding, handleAddToBag, isAuthenticated } = useAddToBagFeedback();

  const selectedVariantStock = useMemo(
    () => findVariantStock(product, selectedSize, selectedColorName),
    [product, selectedSize, selectedColorName],
  );

  const selectedVariantId = useMemo(
    () => findVariantId(product, selectedSize, selectedColorName),
    [product, selectedSize, selectedColorName],
  );

  const isOutOfStock =
    product.isTemporarilyUnavailable ||
    product.stockStatus === "out-of-stock" ||
    product.stockLeft <= 0 ||
    selectedVariantStock <= 0;

  const sizeStockMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const size of product.sizes) {
      map.set(size, findVariantStock(product, size, selectedColorName));
    }
    return map;
  }, [product, selectedColorName]);

  useEffect(() => {
    const dropEndsAt = Date.now() + 3 * 60 * 60 * 1000;

    const tick = () => {
      setTimerText(formatCountdown(dropEndsAt));
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (quantity > Math.max(1, selectedVariantStock)) {
      setQuantity(Math.max(1, selectedVariantStock));
    }
  }, [selectedVariantStock, quantity]);

  const onAddToBag = () => {
    void handleAddToBag(selectedVariantId, quantity);
  };

  const tabContent =
    tab === "fabric"
      ? product.description
      : tab === "fit"
        ? "Precision-engineered fit with support at the waist and freedom through movement."
        : "Machine wash cold with similar colors. Do not bleach. Line dry for best longevity.";

  const stockIndicatorTone =
    selectedVariantStock <= 2
      ? "bg-error"
      : selectedVariantStock <= 5
        ? "bg-primary"
        : "bg-secondary";
  const stockPercent = clampPercent((selectedVariantStock / Math.max(12, selectedVariantStock)) * 100);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-medium tracking-tight text-primary md:text-5xl">{product.name}</h1>
          <button
            type="button"
            className="rounded-full p-2 text-primary transition-colors hover:bg-surface-container"
            aria-label="Share product"
          >
            <span className="material-symbols-outlined">share</span>
          </button>
        </div>

        <div className="mt-2">
          <ProductRatingHeader slug={product.slug} initialSummary={initialRatingSummary} />
        </div>

        <div className="mt-5">
          <FormattedPrice amountSek={product.priceSek} showVat className="text-3xl font-medium text-primary" />
        </div>
      </div>

      <div className="rounded-lg border border-outline-variant/30 bg-surface-container-low p-4">
        <ProductEngagementBar
          productId={product.id}
          slug={product.slug}
          initialStats={product.stats}
        />
      </div>

      <div className="space-y-5">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-primary">
            {t("color")} <span className="font-normal text-secondary">/ {product.colors[selectedColor]?.name}</span>
          </p>
          <div className="flex gap-3">
            {product.colors.map((color, index) => (
              <button
                key={`${color.hex}-${color.name}`}
                type="button"
                onClick={() => setSelectedColor(index)}
                className={`h-10 w-10 rounded-full transition-all ${
                  selectedColor === index
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-surface"
                    : "hover:ring-2 hover:ring-outline-variant hover:ring-offset-2 hover:ring-offset-surface"
                }`}
                style={{ backgroundColor: color.hex }}
                aria-label={color.name}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">
              {t("selectSize")}
            </span>
            <button
              type="button"
              className="text-[11px] font-semibold uppercase tracking-[0.1em] text-secondary underline underline-offset-4"
            >
              {t("sizeGuide")}
            </button>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {product.sizes.map((size) => {
              const sizeStock = sizeStockMap.get(size) ?? 0;
              const sizeUnavailable = sizeStock <= 0;

              return (
                <button
                  key={size}
                  type="button"
                  disabled={sizeUnavailable}
                  onClick={() => setSelectedSize(size)}
                  className={`h-12 rounded-lg text-xs font-semibold uppercase tracking-[0.1em] transition-all ${
                    sizeUnavailable
                      ? "cursor-not-allowed border border-outline-variant/40 text-on-surface-variant/40 line-through"
                      : selectedSize === size
                        ? "border-2 border-primary bg-primary text-on-primary"
                        : "border border-outline-variant text-secondary hover:border-primary hover:text-primary"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {product.isTemporarilyUnavailable ? (
        <div className="rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-secondary">
            {t("temporarilyUnavailable")}
          </p>
        </div>
      ) : isOutOfStock ? (
        <div className="rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-secondary">
            {t("outOfStock")}
          </p>
          <NotifyWhenBackForm
            productId={product.id}
            slug={product.slug}
            variantId={selectedVariantId}
            size={selectedSize}
            color={selectedColorName}
          />
        </div>
      ) : (
        <div className="rounded-lg border border-outline-variant/30 bg-surface-container-low p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className={`h-2 w-2 animate-pulse rounded-full ${stockIndicatorTone}`} />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-secondary">
                  {t("limitedStock")}
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">
                  {t("stockLeft", { count: selectedVariantStock })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-secondary">
                Drop ends in
              </span>
              <span className="font-mono text-sm font-semibold text-primary" suppressHydrationWarning>
                {timerText}
              </span>
            </div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-variant/70">
            <div
              className={`h-full rounded-full transition-all ${stockIndicatorTone}`}
              style={{ width: `${stockPercent}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex h-14 gap-3">
          <div className="flex w-32 items-center justify-between rounded-lg border border-outline-variant px-3">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="text-secondary transition-colors hover:text-primary"
              aria-label="Decrease quantity"
            >
              <span className="material-symbols-outlined">remove</span>
            </button>
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(Math.max(1, selectedVariantStock), q + 1))}
              className="text-secondary transition-colors hover:text-primary"
              aria-label="Increase quantity"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
          {!isOutOfStock && (
            <button
              type="button"
              onClick={onAddToBag}
              disabled={adding}
              className="flex-1 rounded-lg bg-primary text-xs font-semibold uppercase tracking-[0.12em] text-on-primary transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {adding ? t("cart.adding") : t("addToBag")}
            </button>
          )}
        </div>

        <WishlistToggleButton
          productId={product.id}
          variant="labeled"
          className="h-14 w-full justify-center rounded-lg border border-primary"
          onToggle={(added) => setWishlistFeedback(added ? tWishlist("added") : tWishlist("removed"))}
        />
      </div>

      {(feedback || wishlistFeedback) && (
        <p className="text-xs text-secondary" role="status">
          {feedback ?? wishlistFeedback}
          {!isAuthenticated && feedback === t("cart.signInRequired") && (
            <>
              {" "}
              <Link href="/account/login" className="font-semibold text-primary underline">
                {t("cart.signInCta")}
              </Link>
            </>
          )}
        </p>
      )}

      <div className="flex items-center justify-between rounded-lg border border-secondary-container bg-secondary-container/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="rounded bg-primary px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-on-primary">
            Klarna
          </span>
          <span className="text-sm text-secondary">Pay in 30 days. No interest.</span>
        </div>
        <button type="button" className="text-secondary" aria-label="Klarna info">
          <span className="material-symbols-outlined text-[18px]">info</span>
        </button>
      </div>

      <section className="border-t border-outline-variant/30 pt-8">
        <div className="mb-5 flex gap-8 border-b border-outline-variant/30">
          {([
            ["fabric", "Fabric"],
            ["fit", "Fit & Feel"],
            ["care", "Care Instructions"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`pb-4 text-xs font-semibold uppercase tracking-[0.1em] transition-colors ${
                tab === key
                  ? "border-b-2 border-primary text-primary"
                  : "text-secondary hover:text-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-sm leading-relaxed text-secondary">{tabContent}</p>
      </section>

      <ProductRatingsSection slug={product.slug} />
    </div>
  );
}
