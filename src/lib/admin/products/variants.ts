import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { buildVariantSku } from "./variant-sku";
import type {
  AdminColorOption,
  AdminSizeOption,
  AdminVariantCell,
  AdminVariantMatrix,
  VariantCellWrite,
} from "./variant-types";

type DbSizeRow = { id: string; code: string; sort_order: number };
type DbColorRow = {
  id: string;
  code: string;
  hex: string | null;
  sort_order: number;
  color_translations: { locale: string; name: string }[];
};
type DbVariantRow = {
  id: string;
  size_id: string;
  color_id: string;
  sku: string;
  stock_quantity: number;
  is_active: boolean;
};

function pickColorName(translations: DbColorRow["color_translations"], locale: string): string {
  const contentLocale = ["en", "sv", "es", "de"].includes(locale) ? locale : "en";
  return (
    translations.find((t) => t.locale === contentLocale)?.name ??
    translations.find((t) => t.locale === "en")?.name ??
    translations[0]?.name ??
    "Color"
  );
}

export async function getVariantLookup(locale = "en"): Promise<{
  sizes: AdminSizeOption[];
  colors: AdminColorOption[];
}> {
  const supabase = createSupabaseAdminClient();

  const [{ data: sizes, error: sizesError }, { data: colors, error: colorsError }] =
    await Promise.all([
      supabase.from("sizes").select("id, code, sort_order").order("sort_order"),
      supabase
        .from("colors")
        .select("id, code, hex, sort_order, color_translations(locale, name)")
        .order("sort_order"),
    ]);

  if (sizesError) throw sizesError;
  if (colorsError) throw colorsError;

  return {
    sizes: (sizes ?? []).map((row: DbSizeRow) => ({
      id: row.id,
      code: row.code,
      sortOrder: row.sort_order,
    })),
    colors: (colors ?? []).map((row: DbColorRow) => ({
      id: row.id,
      code: row.code,
      hex: row.hex,
      name: pickColorName(row.color_translations ?? [], locale),
    })),
  };
}

export async function getProductVariantMatrix(
  productId: string,
  locale = "en",
): Promise<AdminVariantMatrix> {
  const supabase = createSupabaseAdminClient();
  const lookup = await getVariantLookup(locale);

  const { data: variants, error } = await supabase
    .from("product_variants")
    .select("id, size_id, color_id, sku, stock_quantity, is_active")
    .eq("product_id", productId)
    .order("created_at");

  if (error) throw error;

  const cells: AdminVariantCell[] = (variants ?? []).map((row: DbVariantRow) => ({
    id: row.id,
    sizeId: row.size_id,
    colorId: row.color_id,
    sku: row.sku,
    stockQuantity: Number(row.stock_quantity ?? 0),
    isActive: row.is_active,
  }));

  return {
    sizes: lookup.sizes,
    colors: lookup.colors,
    cells,
  };
}

export async function syncProductVariantMatrix(
  productId: string,
  productSlug: string,
  cells: VariantCellWrite[],
): Promise<AdminVariantMatrix> {
  const supabase = createSupabaseAdminClient();
  const lookup = await getVariantLookup("en");
  const sizeById = new Map(lookup.sizes.map((s) => [s.id, s]));
  const colorById = new Map(lookup.colors.map((c) => [c.id, c]));

  const normalized = cells
    .map((cell) => {
      const size = sizeById.get(cell.sizeId);
      const color = colorById.get(cell.colorId);
      if (!size || !color) return null;

      const stockQuantity = Math.max(0, Math.floor(cell.stockQuantity));
      const isActive = cell.isActive && stockQuantity >= 0;
      const sku =
        cell.sku.trim() ||
        buildVariantSku(productSlug, size.code, color.code);

      return {
        sizeId: cell.sizeId,
        colorId: cell.colorId,
        sku: sku.toUpperCase(),
        stockQuantity,
        isActive,
      };
    })
    .filter((cell): cell is NonNullable<typeof cell> => cell != null);

  const skuSet = new Set<string>();
  for (const cell of normalized) {
    if (skuSet.has(cell.sku)) {
      throw new Error(`Duplicate SKU in variant matrix: ${cell.sku}`);
    }
    skuSet.add(cell.sku);
  }

  const { data: existing, error: listError } = await supabase
    .from("product_variants")
    .select("id, size_id, color_id, sku")
    .eq("product_id", productId);

  if (listError) throw listError;

  const existingByKey = new Map(
    (existing ?? []).map((row) => [`${row.size_id}:${row.color_id}`, row]),
  );
  const incomingKeys = new Set(normalized.map((cell) => `${cell.sizeId}:${cell.colorId}`));

  const toUpsert = normalized
    .filter((cell) => {
      const key = `${cell.sizeId}:${cell.colorId}`;
      const hasExisting = existingByKey.has(key);
      if (!hasExisting && !cell.isActive && cell.stockQuantity === 0) return false;
      return true;
    })
    .map((cell) => ({
      product_id: productId,
      size_id: cell.sizeId,
      color_id: cell.colorId,
      sku: cell.sku,
      stock_quantity: cell.stockQuantity,
      is_active: cell.isActive,
    }));

  if (toUpsert.length > 0) {
    const { error: upsertError } = await supabase
      .from("product_variants")
      .upsert(toUpsert, { onConflict: "product_id,size_id,color_id" });
    if (upsertError) throw upsertError;
  }

  const idsToDelete = (existing ?? [])
    .filter((row) => !incomingKeys.has(`${row.size_id}:${row.color_id}`))
    .map((row) => row.id);

  if (idsToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("product_variants")
      .delete()
      .in("id", idsToDelete);
    if (deleteError) throw deleteError;
  }

  return getProductVariantMatrix(productId, "en");
}

export function sumVariantStock(cells: AdminVariantCell[]): number {
  return cells
    .filter((cell) => cell.isActive)
    .reduce((sum, cell) => sum + Math.max(0, cell.stockQuantity), 0);
}
