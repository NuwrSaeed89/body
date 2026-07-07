import { CATEGORY_LOCALES, type CategoryLocale } from "./constants";
import { MOCK_ADMIN_CATEGORIES } from "./get-admin-categories";
import type { AdminCategoriesData, AdminCategoryRow } from "./types";
import { shouldUseAdminMock } from "@/lib/admin/should-use-mock";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const MOCK_TRANSLATIONS: Record<string, Record<CategoryLocale, string>> = {
  leggings: { en: "Leggings", sv: "Leggings", es: "Leggings", de: "Leggings" },
  "sports-bras": { en: "Sports Bras", sv: "Sport-BH", es: "Sujetadores deportivos", de: "Sport-BHs" },
  tops: { en: "Tops", sv: "Toppar", es: "Tops", de: "Tops" },
  shorts: { en: "Shorts", sv: "Shorts", es: "Shorts", de: "Shorts" },
  "matching-sets": {
    en: "Matching Sets",
    sv: "Matchande set",
    es: "Conjuntos a juego",
    de: "Matching Sets",
  },
  accessories: { en: "Accessories", sv: "Tillbehör", es: "Accesorios", de: "Accessoires" },
};

const MOCK_PRODUCT_COUNTS: Record<string, number> = {
  leggings: 4,
  "sports-bras": 3,
  tops: 3,
  shorts: 2,
  "matching-sets": 2,
  accessories: 2,
};

function buildMockCategoriesData(locale: string): AdminCategoriesData {
  const contentLocale = CATEGORY_LOCALES.includes(locale as CategoryLocale)
    ? (locale as CategoryLocale)
    : "en";

  const categories: AdminCategoryRow[] = MOCK_ADMIN_CATEGORIES.map((category) => {
    const translations = MOCK_TRANSLATIONS[category.slug] ?? {
      en: category.name,
      sv: category.name,
      es: category.name,
      de: category.name,
    };

    return {
      id: category.id,
      slug: category.slug,
      name: translations[contentLocale] || translations.en,
      sortOrder: category.sortOrder,
      isActive: true,
      productCount: MOCK_PRODUCT_COUNTS[category.slug] ?? 0,
      translations,
    };
  });

  return {
    source: "mock",
    categories,
    totalCount: categories.length,
  };
}

type DbCategoryRow = {
  id: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
  category_translations: { locale: string; name: string }[];
};

async function fetchCategoriesData(locale: string): Promise<AdminCategoriesData> {
  const supabase = createSupabaseAdminClient();
  const contentLocale = CATEGORY_LOCALES.includes(locale as CategoryLocale)
    ? (locale as CategoryLocale)
    : "en";

  const [{ data: categories, error: categoriesError }, { data: links, error: linksError }] =
    await Promise.all([
      supabase
        .from("categories")
        .select(
          `
          id,
          slug,
          sort_order,
          is_active,
          category_translations(locale, name)
        `,
        )
        .order("sort_order", { ascending: true }),
      supabase.from("product_categories").select("category_id"),
    ]);

  if (categoriesError) throw categoriesError;
  if (linksError) throw linksError;

  const productCountByCategory = new Map<string, number>();
  for (const link of links ?? []) {
    const categoryId = link.category_id as string;
    productCountByCategory.set(categoryId, (productCountByCategory.get(categoryId) ?? 0) + 1);
  }

  const rows: AdminCategoryRow[] = ((categories ?? []) as DbCategoryRow[]).map((category) => {
    const translations = Object.fromEntries(
      CATEGORY_LOCALES.map((loc) => {
        const match = category.category_translations.find((t) => t.locale === loc);
        return [loc, match?.name ?? ""];
      }),
    ) as Record<CategoryLocale, string>;

    return {
      id: category.id,
      slug: category.slug,
      name: translations[contentLocale] || translations.en || category.slug,
      sortOrder: category.sort_order,
      isActive: category.is_active,
      productCount: productCountByCategory.get(category.id) ?? 0,
      translations,
    };
  });

  return {
    source: "supabase",
    categories: rows,
    totalCount: rows.length,
  };
}

export async function getAdminCategoriesData(locale: string): Promise<AdminCategoriesData> {
  if (shouldUseAdminMock()) {
    return buildMockCategoriesData(locale);
  }

  try {
    return await fetchCategoriesData(locale);
  } catch (error) {
    console.error("[admin] categories list fetch failed:", error);
    return buildMockCategoriesData(locale);
  }
}
