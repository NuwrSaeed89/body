"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type { ShopCategory } from "@/lib/shop-data";

type CategoryTabsProps = {
  active: ShopCategory;
  onChange: (category: ShopCategory) => void;
  sticky?: boolean;
};

export function CategoryTabs({
  active,
  onChange,
  sticky = false,
}: CategoryTabsProps) {
  const t = useTranslations("shop.categories");

  const categories: ShopCategory[] = [
    "all",
    "leggings",
    "sports-bras",
    "tops",
    "shorts",
    "matching-sets",
  ];

  return (
    <nav
      className={
        sticky
          ? "sticky top-14 z-40 border-b border-outline-variant/30 bg-background/95 py-4 backdrop-blur-sm md:static md:border-0 md:bg-transparent md:py-0"
          : ""
      }
    >
      <div className="hide-scrollbar flex gap-6 overflow-x-auto px-5 md:flex-wrap md:overflow-visible md:px-0">
        {categories.map((category) => {
          const isActive = active === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => onChange(category)}
              className={`shrink-0 whitespace-nowrap pb-1 text-xs font-semibold uppercase tracking-[0.1em] transition-colors ${
                isActive
                  ? "border-b-2 border-primary text-primary"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              {t(category)}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

type FilterSheetProps = {
  open: boolean;
  onClose: () => void;
  resultCount: number;
};

const COLOR_SWATCHES = ["#000000", "#E5E5E0", "#5D5F5D", "#A8B5A3", "#3C2A21", "#F5F5DC"];
const SIZES = ["XS", "S", "M", "L", "XL"] as const;

export function FilterSheet({ open, onClose, resultCount }: FilterSheetProps) {
  const t = useTranslations("shop.filters");
  const [selectedSize, setSelectedSize] = useState("S");
  const [selectedColor, setSelectedColor] = useState(COLOR_SWATCHES[0]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <>
      <div
        className={`shop-filter-backdrop fixed inset-0 z-[100] bg-background transition-opacity md:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={`shop-filter-sheet fixed bottom-0 left-0 right-0 z-[101] flex h-[85dvh] flex-col overflow-hidden rounded-t-[32px] bg-background shadow-2xl transition-transform duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] md:hidden ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        aria-hidden={!open}
      >
        <div className="flex w-full justify-center pb-2 pt-4">
          <div className="h-1.5 w-10 rounded-full bg-outline-variant/50" />
        </div>

        <div className="flex items-center justify-between border-b border-outline-variant/10 px-5 py-4">
          <h2 className="text-lg font-semibold tracking-wide text-primary">{t("filtersTitle")}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant transition-colors active:text-primary"
          >
            {t("clearAll")}
          </button>
        </div>

        <div className="flex-1 space-y-10 overflow-y-auto px-5 py-6">
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.1em]">{t("size")}</h3>
            <div className="grid grid-cols-5 gap-2">
              {SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`rounded-lg border py-3 text-xs font-semibold uppercase tracking-[0.1em] transition-colors ${
                    selectedSize === size
                      ? "border-primary bg-primary text-on-primary"
                      : "border-outline-variant active:bg-primary active:text-on-primary"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.1em]">{t("color")}</h3>
            <div className="flex flex-wrap gap-4">
              {COLOR_SWATCHES.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`h-8 w-8 rounded-full ${
                    selectedColor === color
                      ? "ring-2 ring-primary ring-offset-2"
                      : "ring-1 ring-outline-variant"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={color}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.1em]">
              {t("priceRange")}
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex-1 rounded-lg border border-outline-variant bg-surface-container-low p-3">
                <span className="block text-[10px] font-semibold uppercase text-on-surface-variant">
                  {t("min")}
                </span>
                <span className="text-sm">$0</span>
              </div>
              <div className="h-px w-4 bg-outline-variant" />
              <div className="flex-1 rounded-lg border border-outline-variant bg-surface-container-low p-3">
                <span className="block text-[10px] font-semibold uppercase text-on-surface-variant">
                  {t("max")}
                </span>
                <span className="text-sm">$250</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.1em]">
              {t("collection")}
            </h3>
            <div className="space-y-4">
              {[t("signatureEssentials"), t("zenSeries")].map((label) => (
                <label key={label} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="h-6 w-6 rounded border-outline-variant text-primary focus:ring-0"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-outline-variant/10 p-6 pb-safe">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-primary py-4 text-xs font-semibold uppercase tracking-widest text-on-primary shadow-lg transition-all active:scale-95"
          >
            {t("showResults", { count: resultCount })}
          </button>
        </div>
      </aside>
    </>
  );
}

function FilterCheckbox({ label }: { label: string }) {
  return (
    <label className="group flex cursor-pointer items-center gap-3">
      <input
        type="checkbox"
        className="h-4 w-4 rounded-none border-outline-variant text-primary focus:ring-primary"
      />
      <span className="text-sm text-on-surface-variant transition-colors group-hover:text-primary">
        {label}
      </span>
    </label>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

type ShopSidebarFiltersProps = {
  className?: string;
};

export function ShopSidebarFilters({ className = "" }: ShopSidebarFiltersProps) {
  const t = useTranslations("shop.filters");

  return (
    <aside className={`hidden w-64 shrink-0 space-y-10 md:block ${className}`}>
      <FilterGroup title={t("availability")}>
        <FilterCheckbox label={t("inStock")} />
        <FilterCheckbox label={t("outOfStock")} />
      </FilterGroup>
      <FilterGroup title={t("collection")}>
        <FilterCheckbox label={t("latestDrop")} />
        <FilterCheckbox label={t("premiumLine")} />
        <FilterCheckbox label={t("bestSellers")} />
      </FilterGroup>
      <FilterGroup title={t("size")}>
        {SIZES.map((size) => (
          <FilterCheckbox key={size} label={size} />
        ))}
      </FilterGroup>
    </aside>
  );
}
