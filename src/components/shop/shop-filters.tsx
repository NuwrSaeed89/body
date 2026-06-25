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
    "accessories",
  ];

  return (
    <nav
      className={`${
        sticky
          ? "sticky top-20 z-40 border-b border-outline-variant/30 bg-background/95 py-4 backdrop-blur-sm md:static md:border-0 md:bg-transparent md:py-0"
          : ""
      }`}
    >
      <div className="hide-scrollbar flex gap-6 overflow-x-auto pb-2 md:flex-wrap md:overflow-visible">
        {categories.map((category) => {
          const isActive = active === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => onChange(category)}
              className={`shrink-0 whitespace-nowrap border-b-2 pb-2 text-xs font-semibold uppercase tracking-[0.1em] transition-colors ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-primary"
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
};

export function FilterSheet({ open, onClose }: FilterSheetProps) {
  const t = useTranslations("shop.filters");

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={`fixed inset-x-0 bottom-0 z-[70] max-h-[85vh] overflow-y-auto rounded-t-2xl bg-surface p-6 shadow-2xl transition-transform duration-300 md:hidden ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        aria-hidden={!open}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-primary">
            {t("title")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-primary"
            aria-label={t("close")}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-8">
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
            {["XS", "S", "M", "L", "XL"].map((size) => (
              <FilterCheckbox key={size} label={size} />
            ))}
          </FilterGroup>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-8 w-full bg-primary py-4 text-xs font-semibold uppercase tracking-[0.1em] text-white"
        >
          {t("apply")}
        </button>
      </aside>
    </>
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
      <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
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
        {["XS", "S", "M", "L", "XL"].map((size) => (
          <FilterCheckbox key={size} label={size} />
        ))}
      </FilterGroup>
    </aside>
  );
}
