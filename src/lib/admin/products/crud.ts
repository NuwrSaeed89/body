import { DEFAULT_PRODUCT_CURRENCY } from "@/lib/currency";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  findRestockedVariantIds,
  scheduleWaitingListRestockNotify,
} from "@/lib/waiting-list/notify-on-restock";
import { DEFAULT_COLOR_CODE, DEFAULT_SIZE_CODE } from "./constants";
import { buildVariantSku } from "./variant-sku";
import { resolvePrimaryCategoryFromLinks } from "./resolve-category";
import type { ProductDetail, ProductWriteInput } from "./types";

type DbProductRow = {
  id: string;
  slug: string;
  status: string;
  base_price: number;
  compare_at_price: number | null;
  currency: string;
  is_latest_drop: boolean;
  is_premium: boolean;
  is_best_seller: boolean;
  is_temporarily_unavailable: boolean;
  low_stock_threshold: number;
  product_translations: { locale: string; name: string; description: string | null }[];
  product_variants: { id: string; stock_quantity: number; is_active: boolean }[];
  product_categories: {
    is_primary: boolean;
    category_id: string;
    categories: {
      id: string;
      slug: string;
      category_translations: { locale: string; name: string }[];
    } | {
      id: string;
      slug: string;
      category_translations: { locale: string; name: string }[];
    }[] | null;
  }[];
};

function buildSku(slug: string): string {
  return buildVariantSku(slug, DEFAULT_SIZE_CODE, DEFAULT_COLOR_CODE);
}

async function resolveDefaultSizeAndColor(supabase: ReturnType<typeof createSupabaseAdminClient>) {
  const [{ data: size }, { data: color }] = await Promise.all([
    supabase.from("sizes").select("id").eq("code", DEFAULT_SIZE_CODE).maybeSingle(),
    supabase.from("colors").select("id").eq("code", DEFAULT_COLOR_CODE).maybeSingle(),
  ]);
  return { sizeId: size?.id ?? null, colorId: color?.id ?? null };
}

async function upsertDefaultVariantStock(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  productId: string,
  slug: string,
  stock: number,
): Promise<string[]> {
  const { data: variants, error: listError } = await supabase
    .from("product_variants")
    .select("id, stock_quantity")
    .eq("product_id", productId)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (listError) throw listError;

  const previous = (variants ?? []).map((row) => ({
    id: row.id as string,
    stock_quantity: Number(row.stock_quantity ?? 0),
  }));

  if (!variants?.length) {
    if (stock <= 0) return [];

    const { sizeId, colorId } = await resolveDefaultSizeAndColor(supabase);
    if (!sizeId || !colorId) return [];

    const { data: inserted, error } = await supabase
      .from("product_variants")
      .insert({
        product_id: productId,
        size_id: sizeId,
        color_id: colorId,
        sku: buildSku(slug),
        stock_quantity: stock,
        is_active: true,
      })
      .select("id")
      .single();
    if (error) throw error;
    return inserted?.id ? [inserted.id as string] : [];
  }

  if (variants.length === 1) {
    const { error } = await supabase
      .from("product_variants")
      .update({ stock_quantity: stock })
      .eq("id", variants[0].id);
    if (error) throw error;

    return findRestockedVariantIds(previous, new Map([[variants[0].id as string, stock]]));
  }

  const currentTotal = variants.reduce((sum, variant) => sum + Number(variant.stock_quantity ?? 0), 0);
  const nextById = new Map<string, number>();

  if (currentTotal <= 0) {
    const { error: resetError } = await supabase
      .from("product_variants")
      .update({ stock_quantity: 0 })
      .eq("product_id", productId)
      .eq("is_active", true);
    if (resetError) throw resetError;

    const { error } = await supabase
      .from("product_variants")
      .update({ stock_quantity: stock })
      .eq("id", variants[0].id);
    if (error) throw error;

    for (const variant of variants) {
      nextById.set(variant.id as string, variant.id === variants[0].id ? stock : 0);
    }
    return findRestockedVariantIds(previous, nextById);
  }

  let assigned = 0;
  for (let index = 0; index < variants.length; index += 1) {
    const variant = variants[index];
    const isLast = index === variants.length - 1;
    const nextQty = isLast
      ? Math.max(0, stock - assigned)
      : Math.round((Number(variant.stock_quantity) / currentTotal) * stock);
    assigned += nextQty;
    nextById.set(variant.id as string, nextQty);

    const { error } = await supabase
      .from("product_variants")
      .update({ stock_quantity: nextQty })
      .eq("id", variant.id);
    if (error) throw error;
  }

  return findRestockedVariantIds(previous, nextById);
}

async function syncProductCategory(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  productId: string,
  categoryId: string | null | undefined,
) {
  const { error: deleteError } = await supabase
    .from("product_categories")
    .delete()
    .eq("product_id", productId);
  if (deleteError) throw deleteError;

  if (!categoryId) return;

  const { error: insertError } = await supabase.from("product_categories").insert({
    product_id: productId,
    category_id: categoryId,
    is_primary: true,
  });
  if (insertError) throw insertError;
}

function mapProductDetail(row: DbProductRow, locale: string): ProductDetail {
  const contentLocale = ["en", "sv", "es", "de"].includes(locale) ? locale : "en";
  const translation =
    row.product_translations.find((t) => t.locale === contentLocale) ??
    row.product_translations[0];
  const stock = row.product_variants
    .filter((v) => v.is_active)
    .reduce((sum, v) => sum + Number(v.stock_quantity ?? 0), 0);
  const { categoryId, categorySlug, categoryName } = resolvePrimaryCategoryFromLinks(
    row.product_categories ?? [],
    contentLocale,
  );

  return {
    id: row.id,
    slug: row.slug,
    name: translation?.name ?? row.slug,
    description: translation?.description ?? null,
    status: row.status as ProductDetail["status"],
    basePrice: Number(row.base_price),
    compareAtPrice: row.compare_at_price !== null ? Number(row.compare_at_price) : null,
    currency: row.currency as ProductDetail["currency"],
    stock,
    isLatestDrop: row.is_latest_drop,
    isPremium: row.is_premium,
    isBestSeller: row.is_best_seller,
    isTemporarilyUnavailable: row.is_temporarily_unavailable,
    lowStockThreshold: Number(row.low_stock_threshold ?? 5),
    locale: contentLocale,
    categoryId,
    categorySlug,
    categoryName,
  };
}

const PRODUCT_SELECT = `
  id,
  slug,
  status,
  base_price,
  compare_at_price,
  currency,
  is_latest_drop,
  is_premium,
  is_best_seller,
  is_temporarily_unavailable,
  low_stock_threshold,
  product_translations(locale, name, description),
  product_variants(id, stock_quantity, is_active),
  product_categories(
    is_primary,
    category_id,
    categories(
      id,
      slug,
      category_translations(locale, name)
    )
  )
`;

export async function getProductById(id: string, locale = "en"): Promise<ProductDetail | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return mapProductDetail(data as unknown as DbProductRow, locale);
}

export async function createProduct(input: ProductWriteInput): Promise<ProductDetail> {
  const supabase = createSupabaseAdminClient();
  const locale = input.locale ?? "en";

  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      slug: input.slug,
      status: input.status,
      base_price: input.basePrice,
      compare_at_price: input.compareAtPrice ?? null,
      currency: input.currency ?? DEFAULT_PRODUCT_CURRENCY,
      is_latest_drop: input.isLatestDrop,
      is_premium: input.isPremium,
      is_best_seller: input.isBestSeller,
      is_temporarily_unavailable: input.isTemporarilyUnavailable,
      low_stock_threshold: input.lowStockThreshold ?? 5,
    })
    .select("id, slug")
    .single();

  if (productError) throw productError;

  const { error: translationError } = await supabase.from("product_translations").insert({
    product_id: product.id,
    locale,
    name: input.name,
    description: input.description ?? null,
  });
  if (translationError) throw translationError;

  const { sizeId, colorId } = await resolveDefaultSizeAndColor(supabase);
  if (sizeId && colorId) {
    const { error: variantError } = await supabase.from("product_variants").insert({
      product_id: product.id,
      size_id: sizeId,
      color_id: colorId,
      sku: buildSku(product.slug),
      stock_quantity: input.stock,
      is_active: true,
    });
    if (variantError) throw variantError;
  }

  await syncProductCategory(supabase, product.id, input.categoryId);

  const detail = await getProductById(product.id, locale);
  if (!detail) throw new Error("Product created but could not be loaded");
  return detail;
}

export async function updateProduct(
  id: string,
  input: ProductWriteInput,
): Promise<ProductDetail> {
  const supabase = createSupabaseAdminClient();
  const locale = input.locale ?? "en";

  const { error: productError } = await supabase
    .from("products")
    .update({
      slug: input.slug,
      status: input.status,
      base_price: input.basePrice,
      compare_at_price: input.compareAtPrice ?? null,
      currency: input.currency ?? DEFAULT_PRODUCT_CURRENCY,
      is_latest_drop: input.isLatestDrop,
      is_premium: input.isPremium,
      is_best_seller: input.isBestSeller,
      is_temporarily_unavailable: input.isTemporarilyUnavailable,
      low_stock_threshold: input.lowStockThreshold ?? 5,
    })
    .eq("id", id);

  if (productError) throw productError;

  const { error: translationError } = await supabase.from("product_translations").upsert(
    {
      product_id: id,
      locale,
      name: input.name,
      description: input.description ?? null,
    },
    { onConflict: "product_id,locale" },
  );
  if (translationError) throw translationError;

  if (input.syncVariantStock !== false) {
    const restockedVariantIds = await upsertDefaultVariantStock(
      supabase,
      id,
      input.slug,
      input.stock,
    );
    if (restockedVariantIds.length > 0) {
      scheduleWaitingListRestockNotify({
        productId: id,
        restockedVariantIds,
        locale,
      });
    }
  }
  await syncProductCategory(supabase, id, input.categoryId);

  const detail = await getProductById(id, locale);
  if (!detail) throw new Error("Product updated but could not be loaded");
  return detail;
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export function mapSupabaseCrudError(error: unknown): string {
  if (!error || typeof error !== "object") return "Unknown error";
  const record = error as { code?: string; message?: string };
  if (record.code === "23505") {
    return "A product with this slug or SKU already exists";
  }
  return record.message ?? "Database operation failed";
}
