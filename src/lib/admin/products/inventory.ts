import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getProductById } from "./crud";
import { DEFAULT_COLOR_CODE, DEFAULT_SIZE_CODE } from "./constants";
import { buildVariantSku } from "./variant-sku";
import type { ProductDetail } from "./types";
import type { InventoryWriteInput } from "./validate-inventory";

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
) {
  const { data: variants, error: listError } = await supabase
    .from("product_variants")
    .select("id, stock_quantity")
    .eq("product_id", productId)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (listError) throw listError;

  if (!variants?.length) {
    const { sizeId, colorId } = await resolveDefaultSizeAndColor(supabase);
    if (!sizeId || !colorId) return;

    const { error } = await supabase.from("product_variants").insert({
      product_id: productId,
      size_id: sizeId,
      color_id: colorId,
      sku: buildSku(slug),
      stock_quantity: stock,
      is_active: true,
    });
    if (error) throw error;
    return;
  }

  if (variants.length === 1) {
    const { error } = await supabase
      .from("product_variants")
      .update({ stock_quantity: stock })
      .eq("id", variants[0].id);
    if (error) throw error;
    return;
  }

  const currentTotal = variants.reduce((sum, variant) => sum + Number(variant.stock_quantity ?? 0), 0);
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
    return;
  }

  let assigned = 0;
  for (let index = 0; index < variants.length; index += 1) {
    const variant = variants[index];
    const isLast = index === variants.length - 1;
    const nextQty = isLast
      ? Math.max(0, stock - assigned)
      : Math.round((Number(variant.stock_quantity) / currentTotal) * stock);
    assigned += nextQty;

    const { error } = await supabase
      .from("product_variants")
      .update({ stock_quantity: nextQty })
      .eq("id", variant.id);
    if (error) throw error;
  }
}

export async function updateProductInventory(
  id: string,
  input: InventoryWriteInput,
  locale = "en",
): Promise<ProductDetail> {
  const supabase = createSupabaseAdminClient();

  const { data: existing, error: loadError } = await supabase
    .from("products")
    .select("id, slug, low_stock_threshold")
    .eq("id", id)
    .maybeSingle();

  if (loadError) throw loadError;
  if (!existing) throw new Error("Product not found");

  if (input.lowStockThreshold !== undefined) {
    const { error } = await supabase
      .from("products")
      .update({ low_stock_threshold: input.lowStockThreshold })
      .eq("id", id);
    if (error) throw error;
  }

  if (input.stock !== undefined) {
    await upsertDefaultVariantStock(supabase, id, existing.slug, input.stock);
  }

  const detail = await getProductById(id, locale);
  if (!detail) throw new Error("Product updated but could not be loaded");
  return detail;
}
