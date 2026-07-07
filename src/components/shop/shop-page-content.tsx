"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ShopGridCard } from "@/components/shop/shop-grid-card";
import {
  CategoryTabs,
  FilterSheet,
  ShopSidebarFilters,
} from "@/components/shop/shop-filters";
import type { ShopCategory, ShopProduct } from "@/lib/shop-data";

type ShopPageContentProps = {
  locale: string;
  products: ShopProduct[];
};

function buildProductsUrl(locale: string, category: ShopCategory, sort: string): string {
  const params = new URLSearchParams({ locale, sort });
  if (category !== "all") {
    params.set("category", category);
  }
  return `/api/products?${params.toString()}`;
}

export function ShopPageContent({ locale, products }: ShopPageContentProps) {
  const t = useTranslations("shop");
  const [category, setCategory] = useState<ShopCategory>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sort, setSort] = useState("newest");
  const [displayedProducts, setDisplayedProducts] = useState(products);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDisplayedProducts(products);
  }, [products]);

  useEffect(() => {
    if (category === "all" && sort === "newest") {
      setDisplayedProducts(products);
      return;
    }

    const controller = new AbortController();

    async function loadProducts() {
      setLoading(true);
      try {
        const response = await fetch(buildProductsUrl(locale, category, sort), {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Failed to load products");
        }
        const data = (await response.json()) as { items: ShopProduct[] };
        setDisplayedProducts(data.items);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("[shop] product fetch failed:", error);
        const fallback =
          category === "all"
            ? products
            : products.filter((product) => product.category === category);
        setDisplayedProducts(fallback);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadProducts();
    return () => controller.abort();
  }, [category, sort, locale, products]);

  return (
    <>
      {/* Mobile layout */}
      <div className="md:hidden">
        <section className="px-5 pb-2 pt-6">
          <nav className="mb-2 flex items-center gap-2">
            <Link
              href="/"
              className="text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant"
            >
              {t("breadcrumb.home")}
            </Link>
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant">
              chevron_right
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">
              {t("breadcrumb.shop")}
            </span>
          </nav>
          <h1 className="text-3xl font-medium tracking-tight text-primary">{t("title")}</h1>
        </section>

        <CategoryTabs active={category} onChange={setCategory} sticky />

        <section className="flex items-center justify-between px-5 py-6">
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 transition-colors active:bg-surface-container"
          >
            <span className="material-symbols-outlined text-[20px]">tune</span>
            <span className="text-xs font-semibold uppercase tracking-[0.1em]">
              {t("filterSort")}
            </span>
          </button>
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
            {loading ? "…" : t("itemCount", { count: displayedProducts.length })}
          </span>
        </section>

        <section className="grid grid-cols-2 gap-x-4 gap-y-8 px-5 pb-32">
          {displayedProducts.map((product) => (
            <ShopGridCard key={product.id} product={product} />
          ))}
        </section>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:block">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-4">
            <h1 className="text-5xl font-medium tracking-tight text-primary">{t("title")}</h1>
            <CategoryTabs active={category} onChange={setCategory} />
          </div>

          <div className="flex items-center gap-4">
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

        <div className="flex flex-col gap-6 md:flex-row">
          <ShopSidebarFilters />
          <div className="min-w-0 flex-1">
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
              {loading ? "…" : t("itemCount", { count: displayedProducts.length })}
            </p>
            <div className="grid grid-cols-3 gap-6 lg:grid-cols-4">
              {displayedProducts.map((product) => (
                <ShopGridCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <FilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        resultCount={displayedProducts.length}
      />
    </>
  );
}
