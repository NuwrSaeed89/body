import type { AdminCategoryOption } from "./types";
import { shouldUseAdminMock } from "@/lib/admin/should-use-mock";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const MOCK_ADMIN_CATEGORIES: AdminCategoryOption[] = [
  { id: "33333333-3333-4333-8333-333333330001", slug: "leggings", name: "Leggings", sortOrder: 1 },
  { id: "33333333-3333-4333-8333-333333330002", slug: "sports-bras", name: "Sports Bras", sortOrder: 2 },
  { id: "33333333-3333-4333-8333-333333330003", slug: "tops", name: "Tops", sortOrder: 3 },
  { id: "33333333-3333-4333-8333-333333330004", slug: "shorts", name: "Shorts", sortOrder: 4 },
  { id: "33333333-3333-4333-8333-333333330005", slug: "matching-sets", name: "Matching Sets", sortOrder: 5 },
  { id: "33333333-3333-4333-8333-333333330006", slug: "accessories", name: "Accessories", sortOrder: 6 },
];

type DbCategory = {
  id: string;
  slug: string;
  sort_order: number;
  category_translations: { locale: string; name: string }[];
};

async function fetchCategories(locale: string): Promise<AdminCategoryOption[]> {
  const supabase = createSupabaseAdminClient();
  const contentLocale = ["en", "sv", "es", "de"].includes(locale) ? locale : "en";

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

  return ((data ?? []) as DbCategory[]).map((category) => {
    const name =
      category.category_translations.find((t) => t.locale === contentLocale)?.name ??
      category.category_translations.find((t) => t.locale === "en")?.name ??
      category.slug;

    return {
      id: category.id,
      slug: category.slug,
      name,
      sortOrder: category.sort_order,
    };
  });
}

export async function getAdminCategories(locale: string): Promise<AdminCategoryOption[]> {
  if (shouldUseAdminMock()) {
    return MOCK_ADMIN_CATEGORIES;
  }
  try {
    return await fetchCategories(locale);
  } catch (error) {
    console.error("[admin] categories fetch failed:", error);
    return MOCK_ADMIN_CATEGORIES;
  }
}
