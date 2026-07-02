import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { resolveCatalogLocale } from "./constants";
import {
  mapDbProductToDetail,
  mapDbProductToShopProduct,
  type DbCatalogProduct,
} from "./map-catalog-product";

const CATALOG_SELECT = `
  id,
  slug,
  status,
  base_price,
  low_stock_threshold,
  is_latest_drop,
  is_premium,
  is_best_seller,
  is_temporarily_unavailable,
  view_count,
  like_count,
  waiting_count,
  units_sold,
  product_translations!inner(name, locale, description, series_label),
  product_variants(
    id,
    sku,
    stock_quantity,
    is_active,
    sizes(code),
    colors(
      id,
      code,
      hex,
      color_translations(locale, name)
    )
  ),
  product_categories(
    is_primary,
    categories(
      id,
      slug,
      category_translations(locale, name)
    )
  ),
  product_media(public_url, alt_text, is_primary, sort_order, kind)
`;

export async function fetchActiveCatalogRows(locale: string): Promise<DbCatalogProduct[]> {
  const supabase = createSupabaseAdminClient();
  const contentLocale = resolveCatalogLocale(locale);

  const { data, error } = await supabase
    .from("products")
    .select(CATALOG_SELECT)
    .eq("status", "active")
    .eq("product_translations.locale", contentLocale)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as DbCatalogProduct[];
}

export async function fetchActiveCatalogProducts(locale: string) {
  const rows = await fetchActiveCatalogRows(locale);
  return rows.map((row) => mapDbProductToShopProduct(row, resolveCatalogLocale(locale)));
}

export async function fetchProductDetailBySlug(slug: string, locale: string) {
  const contentLocale = resolveCatalogLocale(locale);

  for (const tryLocale of [contentLocale, "en"]) {
    const product = await fetchProductDetailRow(slug, tryLocale);
    if (product) return product;
  }

  return null;
}

async function fetchProductDetailRow(slug: string, locale: string) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("products")
    .select(CATALOG_SELECT)
    .eq("slug", slug)
    .eq("status", "active")
    .eq("product_translations.locale", locale)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return mapDbProductToDetail(data as unknown as DbCatalogProduct, locale);
}

export async function fetchActiveProductSlugs(): Promise<string[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("slug")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => row.slug as string);
}

export async function fetchProductsByFlag(
  locale: string,
  flag: "is_latest_drop" | "is_best_seller" | "is_premium",
  limit?: number,
) {
  const supabase = createSupabaseAdminClient();
  const contentLocale = resolveCatalogLocale(locale);

  let query = supabase
    .from("products")
    .select(CATALOG_SELECT)
    .eq("status", "active")
    .eq(flag, true)
    .eq("product_translations.locale", contentLocale)
    .order("created_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;

  return ((data ?? []) as unknown as DbCatalogProduct[]).map((row) =>
    mapDbProductToShopProduct(row, contentLocale),
  );
}

export async function fetchProductRowsByFlag(
  locale: string,
  flag: "is_latest_drop" | "is_best_seller" | "is_premium",
  limit?: number,
): Promise<DbCatalogProduct[]> {
  const supabase = createSupabaseAdminClient();
  const contentLocale = resolveCatalogLocale(locale);

  let query = supabase
    .from("products")
    .select(CATALOG_SELECT)
    .eq("status", "active")
    .eq(flag, true)
    .eq("product_translations.locale", contentLocale)
    .order("created_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as DbCatalogProduct[];
}

export async function fetchProductsByCollectionSlug(
  locale: string,
  collectionSlug: string,
  limit?: number,
) {
  const rows = await fetchProductRowsByCollectionSlug(locale, collectionSlug, limit);
  const contentLocale = resolveCatalogLocale(locale);
  return rows.map((row) => mapDbProductToShopProduct(row, contentLocale));
}

export async function fetchProductRowsByCollectionSlug(
  locale: string,
  collectionSlug: string,
  limit?: number,
): Promise<DbCatalogProduct[]> {
  const supabase = createSupabaseAdminClient();
  const contentLocale = resolveCatalogLocale(locale);

  const { data: collection, error: collectionError } = await supabase
    .from("collections")
    .select("id")
    .eq("slug", collectionSlug)
    .eq("is_active", true)
    .maybeSingle();

  if (collectionError) throw collectionError;
  if (!collection) return [];

  let linksQuery = supabase
    .from("product_collections")
    .select("sort_order, product_id")
    .eq("collection_id", collection.id)
    .order("sort_order", { ascending: true });

  if (limit) linksQuery = linksQuery.limit(limit);

  const { data: links, error: linksError } = await linksQuery;
  if (linksError) throw linksError;
  if (!links?.length) return [];

  const productIds = links.map((link) => link.product_id as string);

  const { data: rows, error } = await supabase
    .from("products")
    .select(CATALOG_SELECT)
    .eq("status", "active")
    .in("id", productIds)
    .eq("product_translations.locale", contentLocale);

  if (error) throw error;

  const byId = new Map(
    ((rows ?? []) as unknown as DbCatalogProduct[]).map((row) => [row.id, row]),
  );

  return productIds
    .map((id) => byId.get(id))
    .filter((row): row is DbCatalogProduct => Boolean(row));
}
