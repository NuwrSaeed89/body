import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { CATEGORY_LOCALES } from "./constants";
import type { CategoryDetail, CategoryWriteInput } from "./types";

type DbCategoryRow = {
  id: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
  category_translations: { locale: string; name: string }[];
};

const CATEGORY_SELECT = `
  id,
  slug,
  sort_order,
  is_active,
  category_translations(locale, name)
`;

async function countProductsForCategory(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  categoryId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("product_categories")
    .select("*", { count: "exact", head: true })
    .eq("category_id", categoryId);

  if (error) throw error;
  return count ?? 0;
}

function mapCategoryDetail(
  row: DbCategoryRow,
  productCount: number,
): CategoryDetail {
  const translations = CATEGORY_LOCALES.map((locale) => {
    const match = row.category_translations.find((t) => t.locale === locale);
    return { locale, name: match?.name ?? "" };
  });

  return {
    id: row.id,
    slug: row.slug,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    translations,
    productCount,
  };
}

async function syncCategoryTranslations(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  categoryId: string,
  translations: CategoryWriteInput["translations"],
) {
  for (const locale of CATEGORY_LOCALES) {
    const translation = translations.find((t) => t.locale === locale);
    const name = translation?.name.trim();

    if (name) {
      const { error } = await supabase.from("category_translations").upsert(
        {
          category_id: categoryId,
          locale,
          name,
        },
        { onConflict: "category_id,locale" },
      );
      if (error) throw error;
      continue;
    }

    const { error } = await supabase
      .from("category_translations")
      .delete()
      .eq("category_id", categoryId)
      .eq("locale", locale);
    if (error) throw error;
  }
}

export async function getCategoryById(id: string): Promise<CategoryDetail | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select(CATEGORY_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const productCount = await countProductsForCategory(supabase, id);
  return mapCategoryDetail(data as unknown as DbCategoryRow, productCount);
}

export async function createCategory(input: CategoryWriteInput): Promise<CategoryDetail> {
  const supabase = createSupabaseAdminClient();

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .insert({
      slug: input.slug,
      sort_order: input.sortOrder,
      is_active: input.isActive,
    })
    .select("id")
    .single();

  if (categoryError) throw categoryError;

  await syncCategoryTranslations(supabase, category.id, input.translations);

  const detail = await getCategoryById(category.id);
  if (!detail) throw new Error("Category created but could not be loaded");
  return detail;
}

export async function updateCategory(
  id: string,
  input: CategoryWriteInput,
): Promise<CategoryDetail> {
  const supabase = createSupabaseAdminClient();

  const { error: categoryError } = await supabase
    .from("categories")
    .update({
      slug: input.slug,
      sort_order: input.sortOrder,
      is_active: input.isActive,
    })
    .eq("id", id);

  if (categoryError) throw categoryError;

  await syncCategoryTranslations(supabase, id, input.translations);

  const detail = await getCategoryById(id);
  if (!detail) throw new Error("Category updated but could not be loaded");
  return detail;
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

export function mapSupabaseCategoryCrudError(error: unknown): string {
  if (!error || typeof error !== "object") return "Unknown error";
  const record = error as { code?: string; message?: string };
  if (record.code === "23505") {
    return "A category with this slug already exists";
  }
  return record.message ?? "Database operation failed";
}
