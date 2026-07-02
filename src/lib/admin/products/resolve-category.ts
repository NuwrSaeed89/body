type CategoryNode = {
  id: string;
  slug: string;
  category_translations: { locale: string; name: string }[];
};

type ProductCategoryLink = {
  is_primary: boolean;
  categories: CategoryNode | CategoryNode[] | null;
};

export function resolvePrimaryCategoryFromLinks(
  links: ProductCategoryLink[] | null | undefined,
  locale: string,
): { categoryId: string | null; categorySlug: string | null; categoryName: string | null } {
  const contentLocale = ["en", "sv", "es", "de"].includes(locale) ? locale : "en";

  const normalized = (links ?? [])
    .map((link) => {
      const raw = link.categories;
      const category = Array.isArray(raw) ? raw[0] : raw;
      return category ? { isPrimary: link.is_primary, category } : null;
    })
    .filter((entry): entry is { isPrimary: boolean; category: CategoryNode } => entry !== null);

  const selected =
    normalized.find((entry) => entry.isPrimary)?.category ?? normalized[0]?.category ?? null;

  if (!selected) {
    return { categoryId: null, categorySlug: null, categoryName: null };
  }

  const name =
    selected.category_translations.find((t) => t.locale === contentLocale)?.name ??
    selected.category_translations.find((t) => t.locale === "en")?.name ??
    selected.slug;

  return {
    categoryId: selected.id,
    categorySlug: selected.slug,
    categoryName: name,
  };
}
