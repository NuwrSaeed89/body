"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import type { ProductDetail } from "@/lib/shop-data";

type ProductPurchasePanelProps = {
  product: ProductDetail;
};

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const t = useTranslations("pdp");
  const [selectedSize, setSelectedSize] = useState(product.sizes[1] ?? product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(0);

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
          <div className="flex shrink-0 items-center gap-0.5 text-primary">
            {Array.from({ length: 4 }).map((_, i) => (
              <span
                key={i}
                className="material-symbols-outlined text-[16px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
            ))}
            <span className="material-symbols-outlined text-[16px]">star_half</span>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-surface-container-low px-3 py-2">
          <span className="material-symbols-outlined text-[18px] text-secondary">
            trending_up
          </span>
          <p className="text-sm text-secondary">
            {t("socialProof", { count: product.socialProof })}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-medium text-primary">{product.price}</span>
          <span className="text-sm text-secondary">{t("inclVat")}</span>
        </div>
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

      <p className="text-sm leading-relaxed text-secondary">{product.description}</p>

      <div className="hidden flex-col gap-3 md:flex">
        <button
          type="button"
          className="w-full bg-primary py-4 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-opacity hover:opacity-90"
        >
          {t("addToBag")}
        </button>
        <button
          type="button"
          className="w-full border border-primary py-4 text-xs font-semibold uppercase tracking-[0.15em] text-primary transition-colors hover:bg-primary hover:text-white"
        >
          {t("addToWishlist")}
        </button>
      </div>
    </div>
  );
}

export function ProductStickyBar({ product }: ProductPurchasePanelProps) {
  const t = useTranslations("pdp");

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-outline-variant/20 bg-surface/95 p-4 backdrop-blur-md md:hidden">
      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-primary">{product.name}</p>
          <p className="text-sm text-secondary">{product.price}</p>
        </div>
        <button
          type="button"
          className="shrink-0 bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-white"
        >
          {t("addToBag")}
        </button>
      </div>
    </div>
  );
}
