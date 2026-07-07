import "server-only";

import { MOCK_ADMIN_CATEGORIES } from "@/lib/admin/categories/get-admin-categories";
import type { ProductDetail, ShopCategory, ShopProduct } from "@/lib/shop-data";
import { PRODUCT_DETAILS, SHOP_PRODUCTS } from "@/lib/shop-data";
import { resolveCatalogLocale } from "./constants";
import type {
  CatalogCollectionItem,
  CatalogColorOption,
  CatalogFilterOptions,
  CatalogProductsResponse,
  CatalogSizeOption,
  ProductListQuery,
} from "./catalog-api-types";
import {
  fetchActiveCatalogRows,
  fetchProductDetailBySlug,
  fetchProductRowsByCollectionSlug,
  fetchProductRowsByFlag,
} from "./fetch-from-supabase";
import {
  mapDbProductToShopProduct,
  resolveCategorySlug,
  type DbCatalogProduct,
} from "./map-catalog-product";
import { shouldUseStorefrontMock } from "./should-use-storefront-mock";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const MOCK_COLLECTIONS: CatalogCollectionItem[] = [
  {
    id: "44444444-4444-4444-8444-444444440001",
    slug: "aero-series",
    name: "Latest Drop: The Aero Series",
    description: "Summer 2024 performance drop",
    collectionType: "latest_drop",
    sortOrder: 1,
  },
  {
    id: "44444444-4444-4444-8444-444444440002",
    slug: "sculpt-collection",
    name: "The Sculpt Collection",
    description: "Engineering silhouettes that empower",
    collectionType: "seasonal",
    sortOrder: 2,
  },
  {
    id: "44444444-4444-4444-8444-444444440003",
    slug: "premium-collection",
    name: "Premium Collection",
    description: "Editorial series — curated essentials",
    collectionType: "premium",
    sortOrder: 3,
  },
  {
    id: "44444444-4444-4444-8444-444444440004",
    slug: "boutique-favorites",
    name: "Boutique Favorites",
    description: "Our most-loved boutique pieces",
    collectionType: "campaign",
    sortOrder: 4,
  },
  {
    id: "44444444-4444-4444-8444-444444440005",
    slug: "limited-edition",
    name: "Limited Edition",
    description: "Exclusive limited releases",
    collectionType: "limited",
    sortOrder: 5,
  },
];

const MOCK_SIZES: CatalogSizeOption[] = [
  { id: "size-xs", code: "XS", sortOrder: 1 },
  { id: "size-s", code: "S", sortOrder: 2 },
  { id: "size-m", code: "M", sortOrder: 3 },
  { id: "size-l", code: "L", sortOrder: 4 },
  { id: "size-xl", code: "XL", sortOrder: 5 },
];

const MOCK_COLORS: CatalogColorOption[] = [
  { id: "color-black", code: "black", hex: "#000000", name: "Black" },
  { id: "color-stone", code: "stone", hex: "#E5E5E0", name: "Stone" },
  { id: "color-slate", code: "slate", hex: "#5D5F5D", name: "Slate" },
  { id: "color-sage", code: "sage", hex: "#A8B5A3", name: "Sage" },
  { id: "color-espresso", code: "espresso", hex: "#3C2A21", name: "Espresso" },
  { id: "color-cream", code: "cream", hex: "#F5F5DC", name: "Cream" },
];

function unwrap<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function totalStock(row: DbCatalogProduct): number {
  return (row.product_variants ?? [])
    .filter((variant) => variant.is_active)
    .reduce((sum, variant) => sum + variant.stock_quantity, 0);
}

function variantMatchesSize(row: DbCatalogProduct, size: string): boolean {
  return (row.product_variants ?? []).some((variant) => {
    if (!variant.is_active) return false;
    const sizeRow = unwrap(variant.sizes);
    return sizeRow?.code?.toUpperCase() === size.toUpperCase();
  });
}

function variantMatchesColor(row: DbCatalogProduct, color: string, locale: string): boolean {
  const normalized = color.toLowerCase();
  return (row.product_variants ?? []).some((variant) => {
    if (!variant.is_active) return false;
    const colorRow = unwrap(variant.colors);
    if (!colorRow) return false;
    if (colorRow.code.toLowerCase() === normalized) return true;
    if (colorRow.hex.toLowerCase() === normalized) return true;
    const name =
      colorRow.color_translations.find((t) => t.locale === locale)?.name ??
      colorRow.color_translations.find((t) => t.locale === "en")?.name;
    return name?.toLowerCase() === normalized;
  });
}

function applyRowFilters(
  rows: DbCatalogProduct[],
  query: ProductListQuery,
  locale: string,
): DbCatalogProduct[] {
  let filtered = rows;

  if (query.category && query.category !== "all") {
    filtered = filtered.filter(
      (row) => resolveCategorySlug(row.product_categories, locale) === query.category,
    );
  }

  if (query.size) {
    filtered = filtered.filter((row) => variantMatchesSize(row, query.size!));
  }

  if (query.color) {
    filtered = filtered.filter((row) => variantMatchesColor(row, query.color!, locale));
  }

  if (query.minPrice !== undefined) {
    filtered = filtered.filter((row) => Number(row.base_price) >= query.minPrice!);
  }

  if (query.maxPrice !== undefined) {
    filtered = filtered.filter((row) => Number(row.base_price) <= query.maxPrice!);
  }

  if (query.availability === "in-stock") {
    filtered = filtered.filter((row) => totalStock(row) > 0);
  }

  if (query.availability === "out-of-stock") {
    filtered = filtered.filter((row) => totalStock(row) === 0);
  }

  return filtered;
}

function sortRows(rows: DbCatalogProduct[], sort = "newest"): DbCatalogProduct[] {
  const copy = [...rows];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => Number(a.base_price) - Number(b.base_price));
    case "price-desc":
      return copy.sort((a, b) => Number(b.base_price) - Number(a.base_price));
    case "best-selling":
      return copy.sort((a, b) => Number(b.units_sold) - Number(a.units_sold));
    case "newest":
    default:
      return copy;
  }
}

function mapRowsToShopProducts(rows: DbCatalogProduct[], locale: string): ShopProduct[] {
  const contentLocale = resolveCatalogLocale(locale);
  return rows.map((row) => mapDbProductToShopProduct(row, contentLocale));
}

function filterMockProducts(query: ProductListQuery): ShopProduct[] {
  let items = [...SHOP_PRODUCTS];

  if (query.category && query.category !== "all") {
    items = items.filter((product) => product.category === query.category);
  }

  if (query.minPrice !== undefined) {
    items = items.filter((product) => product.priceSek >= query.minPrice!);
  }

  if (query.maxPrice !== undefined) {
    items = items.filter((product) => product.priceSek <= query.maxPrice!);
  }

  if (query.availability === "in-stock") {
    items = items.filter((product) => product.stockStatus !== "out-of-stock");
  }

  if (query.availability === "out-of-stock") {
    items = items.filter((product) => product.stockStatus === "out-of-stock");
  }

  if (query.flag === "is_latest_drop") {
    items = items.filter((product) => product.badgeKey === "new");
  }

  if (query.flag === "is_best_seller") {
    items = items.filter((product) => product.badgeKey === "bestSeller");
  }

  if (query.flag === "is_premium") {
    items = items.filter((product) => product.badgeKey === "limitedRelease");
  }

  switch (query.sort) {
    case "price-asc":
      items.sort((a, b) => a.priceSek - b.priceSek);
      break;
    case "price-desc":
      items.sort((a, b) => b.priceSek - a.priceSek);
      break;
    case "best-selling":
      items.sort((a, b) => {
        const aSold = PRODUCT_DETAILS[a.slug]?.stats.unitsSold ?? 0;
        const bSold = PRODUCT_DETAILS[b.slug]?.stats.unitsSold ?? 0;
        return bSold - aSold;
      });
      break;
    default:
      break;
  }

  if (query.limit) {
    items = items.slice(0, query.limit);
  }

  return items;
}

export async function listCatalogProducts(query: ProductListQuery): Promise<CatalogProductsResponse> {
  if (shouldUseStorefrontMock()) {
    const items = filterMockProducts(query);
    return { items, total: items.length };
  }

  const locale = resolveCatalogLocale(query.locale);
  let rows: DbCatalogProduct[];

  if (query.collection) {
    rows = await fetchProductRowsByCollectionSlug(locale, query.collection);
  } else if (query.flag) {
    rows = await fetchProductRowsByFlag(locale, query.flag);
  } else {
    rows = await fetchActiveCatalogRows(locale);
  }

  rows = applyRowFilters(rows, query, locale);
  rows = sortRows(rows, query.sort);
  const items = mapRowsToShopProducts(rows, locale);
  const limited = query.limit ? items.slice(0, query.limit) : items;

  return { items: limited, total: items.length };
}

export async function getCatalogProductBySlug(
  slug: string,
  locale: string,
): Promise<ProductDetail | null> {
  if (shouldUseStorefrontMock()) {
    return PRODUCT_DETAILS[slug] ?? null;
  }

  return fetchProductDetailBySlug(slug, locale);
}

export async function listCatalogCategories(locale: string) {
  if (shouldUseStorefrontMock()) {
    return MOCK_ADMIN_CATEGORIES.map((category) => ({
      id: category.id,
      slug: category.slug,
      name: category.name,
      sortOrder: category.sortOrder,
    }));
  }

  const supabase = createSupabaseAdminClient();
  const contentLocale = resolveCatalogLocale(locale);

  const { data, error } = await supabase
    .from("categories")
    .select(
      `
      id,
      slug,
      sort_order,
      category_translations(locale, name)
    `,
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return ((data ?? []) as Array<{
    id: string;
    slug: string;
    sort_order: number;
    category_translations: { locale: string; name: string }[];
  }>).map((category) => ({
    id: category.id,
    slug: category.slug,
    name:
      category.category_translations.find((t) => t.locale === contentLocale)?.name ??
      category.category_translations.find((t) => t.locale === "en")?.name ??
      category.slug,
    sortOrder: category.sort_order,
  }));
}

export async function listCatalogCollections(
  locale: string,
  options?: { includeProductCounts?: boolean },
): Promise<CatalogCollectionItem[]> {
  if (shouldUseStorefrontMock()) {
    return MOCK_COLLECTIONS;
  }

  const supabase = createSupabaseAdminClient();
  const contentLocale = resolveCatalogLocale(locale);

  const { data, error } = await supabase
    .from("collections")
    .select(
      `
      id,
      slug,
      collection_type,
      sort_order,
      collection_translations(locale, name, description)
    `,
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  const collections = ((data ?? []) as Array<{
    id: string;
    slug: string;
    collection_type: string;
    sort_order: number;
    collection_translations: { locale: string; name: string; description: string | null }[];
  }>).map((collection) => {
    const translation =
      collection.collection_translations.find((t) => t.locale === contentLocale) ??
      collection.collection_translations.find((t) => t.locale === "en");

    return {
      id: collection.id,
      slug: collection.slug,
      name: translation?.name ?? collection.slug,
      description: translation?.description ?? null,
      collectionType: collection.collection_type,
      sortOrder: collection.sort_order,
    };
  });

  if (!options?.includeProductCounts) {
    return collections;
  }

  const { data: links, error: linksError } = await supabase
    .from("product_collections")
    .select("collection_id, product_id, products!inner(status)")
    .eq("products.status", "active");

  if (linksError) throw linksError;

  const counts = new Map<string, number>();
  for (const link of links ?? []) {
    const collectionId = link.collection_id as string;
    counts.set(collectionId, (counts.get(collectionId) ?? 0) + 1);
  }

  return collections.map((collection) => ({
    ...collection,
    productCount: counts.get(collection.id) ?? 0,
  }));
}

export async function getCatalogCollectionWithProducts(
  slug: string,
  locale: string,
  query: Omit<ProductListQuery, "collection"> = { locale },
): Promise<{ collection: CatalogCollectionItem | null; products: ShopProduct[] }> {
  const collections = await listCatalogCollections(locale);
  const collection = collections.find((item) => item.slug === slug) ?? null;
  const { items } = await listCatalogProducts({ ...query, locale, collection: slug });
  return { collection, products: items };
}

export async function getCatalogFilterOptions(locale: string): Promise<CatalogFilterOptions> {
  if (shouldUseStorefrontMock()) {
    const prices = SHOP_PRODUCTS.map((product) => product.priceSek);
    return {
      categories: MOCK_ADMIN_CATEGORIES.map((category) => ({
        id: category.id,
        slug: category.slug,
        name: category.name,
        sortOrder: category.sortOrder,
      })),
      collections: MOCK_COLLECTIONS,
      sizes: MOCK_SIZES,
      colors: MOCK_COLORS,
      priceRange: {
        minSek: Math.min(...prices),
        maxSek: Math.max(...prices),
      },
    };
  }

  const supabase = createSupabaseAdminClient();
  const contentLocale = resolveCatalogLocale(locale);

  const [categories, collections, sizesResult, colorsResult, priceResult] = await Promise.all([
    listCatalogCategories(locale),
    listCatalogCollections(locale),
    supabase.from("sizes").select("id, code, sort_order").order("sort_order"),
    supabase
      .from("colors")
      .select(
        `
        id,
        code,
        hex,
        color_translations(locale, name)
      `,
      )
      .order("sort_order"),
    supabase.from("products").select("base_price").eq("status", "active"),
  ]);

  if (sizesResult.error) throw sizesResult.error;
  if (colorsResult.error) throw colorsResult.error;
  if (priceResult.error) throw priceResult.error;

  const sizes: CatalogSizeOption[] = ((sizesResult.data ?? []) as Array<{
    id: string;
    code: string;
    sort_order: number;
  }>).map((size) => ({
    id: size.id,
    code: size.code,
    sortOrder: size.sort_order,
  }));

  const colors: CatalogColorOption[] = (
    (colorsResult.data ?? []) as Array<{
      id: string;
      code: string;
      hex: string;
      color_translations: { locale: string; name: string }[];
    }>
  ).map((color) => ({
    id: color.id,
    code: color.code,
    hex: color.hex,
    name:
      color.color_translations.find((t) => t.locale === contentLocale)?.name ??
      color.color_translations.find((t) => t.locale === "en")?.name ??
      color.code,
  }));

  const prices = ((priceResult.data ?? []) as Array<{ base_price: number }>).map((row) =>
    Number(row.base_price),
  );

  return {
    categories,
    collections,
    sizes,
    colors,
    priceRange: {
      minSek: prices.length ? Math.min(...prices) : 0,
      maxSek: prices.length ? Math.max(...prices) : 0,
    },
  };
}
