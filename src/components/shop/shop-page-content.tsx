"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ShopGridCard } from "@/components/shop/shop-grid-card";
import {
  CategoryTabs,
  FilterSheet,
  ShopSidebarFilters,
} from "@/components/shop/shop-filters";
import type { ShopCategory, ShopProduct } from "@/lib/shop-data";

type ShopPageContentProps = {
  products: ShopProduct[];
};

export function ShopPageContent({ products }: ShopPageContentProps) {
  const t = useTranslations("shop");
  const [category, setCategory] = useState<ShopCategory>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sort, setSort] = useState("newest");

  const filtered = useMemo(() => {
    if (category === "all") return products;
    return products.filter((p) => p.category === category);
  }, [category, products]);

  return (
    <>
      <div className="mb-8 flex flex-col gap-6 md:mb-12 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-medium tracking-tight text-primary md:text-5xl">
            {t("title")}
          </h1>
          <div className="hidden md:block">
            <CategoryTabs active={category} onChange={setCategory} />
          </div>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
            {t("sortBy")}
          </span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="cursor-pointer border-none bg-transparent text-xs font-semibold uppercase tracking-[0.1em] text-primary focus:ring-0"
          >
            <option value="newest">{t("sort.newest")}</option>
            <option value="priceAsc">{t("sort.priceAsc")}</option>
            <option value="priceDesc">{t("sort.priceDesc")}</option>
            <option value="bestSelling">{t("sort.bestSelling")}</option>
          </select>
        </div>
      </div>

      <div className="md:hidden">
        <CategoryTabs active={category} onChange={setCategory} sticky />
      </div>

      <div className="mb-6 flex items-center justify-between py-6 md:hidden">
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 transition-colors hover:bg-surface-container"
        >
          <span className="material-symbols-outlined text-[20px]">tune</span>
          <span className="text-xs font-semibold uppercase tracking-[0.1em]">
            {t("filterSort")}
          </span>
        </button>
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
          {t("itemCount", { count: filtered.length })}
        </span>
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:gap-6">
        <ShopSidebarFilters />
        <div className="min-w-0 flex-1">
          <p className="mb-6 hidden text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant md:block">
            {t("itemCount", { count: filtered.length })}
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {filtered.map((product) => (
              <ShopGridCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>

      <FilterSheet open={filterOpen} onClose={() => setFilterOpen(false)} />
    </>
  );
}
