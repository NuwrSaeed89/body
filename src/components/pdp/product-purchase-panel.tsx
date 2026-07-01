"use client";

import { useTranslations } from "next-intl";
import { ProductEngagementBar } from "@/components/pdp/product-engagement-bar";
import { ProductRatingHeader } from "@/components/pdp/product-rating-header";
import { ProductRatingsSection } from "@/components/pdp/product-ratings-section";
import { FormattedPrice } from "@/components/ui/formatted-price";
import { NotifyWhenBackForm } from "@/components/stock-notify/notify-when-back-form";
import { WishlistToggleButton } from "@/components/wishlist/wishlist-toggle-button";
import { useState } from "react";
import type { ProductDetail } from "@/lib/shop-data";
import type { ProductRatingSummary } from "@/lib/product-ratings/types";

type ProductPurchasePanelProps = {
  product: ProductDetail;
  initialRatingSummary?: ProductRatingSummary;
};

export function ProductPurchasePanel({ product, initialRatingSummary }: ProductPurchasePanelProps) {
  const t = useTranslations("pdp");
  const tWishlist = useTranslations("wishlist");
  const [selectedSize, setSelectedSize] = useState(product.sizes[1] ?? product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(0);
  const [wishlistFeedback, setWishlistFeedback] = useState<string | null>(null);
  const isOutOfStock = product.stockStatus === "out-of-stock" || product.stockLeft <= 0;
  const selectedColorName = product.colors[selectedColor]?.name ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-secondary">
          {product.series}
        </p>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-medium uppercase tracking-wider text-primary md:text-2xl">
            {product.name}
          </h1>
          <ProductRatingHeader slug={product.slug} initialSummary={initialRatingSummary} />
        </div>
        <ProductEngagementBar slug={product.slug} initialStats={product.stats} />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-baseline gap-2">
          <FormattedPrice
            amountSek={product.priceSek}
            showVat
            className="text-2xl font-medium text-primary"
          />
        </div>
        {isOutOfStock ? (
          <div className="rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-secondary">
              {t("outOfStock")}
            </p>
            <NotifyWhenBackForm
              productId={product.id}
              slug={product.slug}
              size={selectedSize}
              color={selectedColorName}
            />
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border border-red-200/50 bg-red-50/50 px-4 py-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase text-red-700">
                {t("limitedStock")}
              </span>
              <span className="text-sm font-semibold text-red-700">
                {t("stockLeft", { count: product.stockLeft })}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">
          {t("color")} / {product.colors[selectedColor]?.name}
        </span>
        <div className="flex gap-4">
          {product.colors.map((color, index) => (
            <button
              key={color.hex}
              type="button"
              onClick={() => setSelectedColor(index)}
              className={`h-10 w-10 rounded-full transition-all ${
                selectedColor === index
                  ? "ring-2 ring-primary ring-offset-2"
                  : "hover:ring-2 hover:ring-outline-variant hover:ring-offset-2"
              }`}
              style={{ backgroundColor: color.hex }}
              aria-label={color.name}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
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
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {product.sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setSelectedSize(size)}
              className={`flex h-12 items-center justify-center rounded-lg text-xs font-semibold uppercase tracking-[0.1em] transition-all ${
                selectedSize === size
                  ? "border-2 border-primary text-primary"
                  : "border border-outline-variant text-secondary hover:border-primary hover:text-primary"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <ProductRatingsSection slug={product.slug} />

      <p className="text-sm leading-relaxed text-secondary">{product.description}</p>

      <div className="hidden flex-col gap-3 md:flex">
        {!isOutOfStock && (
          <button
            type="button"
            className="w-full bg-primary py-4 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-opacity hover:opacity-90"
          >
            {t("addToBag")}
          </button>
        )}
        <div className="flex flex-col gap-2">
          <WishlistToggleButton
            productId={product.id}
            variant="labeled"
            iconClassName="text-[20px]"
            onToggle={(added) =>
              setWishlistFeedback(added ? tWishlist("added") : tWishlist("removed"))
            }
          />
          {wishlistFeedback && (
            <p className="text-xs text-secondary" role="status">
              {wishlistFeedback}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProductStickyBar({ product }: ProductPurchasePanelProps) {
  const t = useTranslations("pdp");
  const isOutOfStock = product.stockStatus === "out-of-stock" || product.stockLeft <= 0;

  return (
    <div className="fixed inset-x-0 bottom-[var(--mobile-nav-height)] z-40 border-t border-outline-variant/20 bg-surface/95 p-4 backdrop-blur-md md:hidden">
      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-primary">{product.name}</p>
          <FormattedPrice amountSek={product.priceSek} className="text-sm text-secondary" />
        </div>
        {!isOutOfStock && (
          <button
            type="button"
            className="shrink-0 bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-white"
          >
            {t("addToBag")}
          </button>
        )}
      </div>
    </div>
  );
}
