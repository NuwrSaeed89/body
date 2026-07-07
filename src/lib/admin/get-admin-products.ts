import { formatInteger, formatSekAmount } from "./format";
import type { AdminProductsData } from "./list-types";
import { MOCK_ADMIN_PRODUCTS } from "./mock-list-data";
import { resolvePrimaryCategoryFromLinks } from "./products/resolve-category";
import { shouldUseAdminMock } from "./should-use-mock";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type DbProduct = {
  id: string;
  slug: string;
  status: string;
  base_price: number;
  units_sold: number;
  view_count: number;
  is_latest_drop: boolean;
  is_premium: boolean;
  is_best_seller: boolean;
  is_temporarily_unavailable: boolean;
  product_translations: { name: string; locale: string; description: string | null }[];
  product_variants: { stock_quantity: number; is_active: boolean }[];
  product_categories: {
    is_primary: boolean;
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
  product_media: { public_url: string; is_primary: boolean; sort_order: number; kind: string }[];
};

function formatProductStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

async function fetchProducts(locale: string): Promise<AdminProductsData> {
  const supabase = createSupabaseAdminClient();
  const contentLocale = ["en", "sv", "es", "de"].includes(locale) ? locale : "en";

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      slug,
      status,
      base_price,
      units_sold,
      view_count,
      is_latest_drop,
      is_premium,
      is_best_seller,
      is_temporarily_unavailable,
      product_translations!inner(name, locale, description),
      product_variants(stock_quantity, is_active),
      product_categories(
        is_primary,
        categories(
          id,
          slug,
          category_translations(locale, name)
        )
      ),
      product_media(public_url, is_primary, sort_order, kind)
    `,
    )
    .eq("product_translations.locale", contentLocale)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const products = ((data ?? []) as unknown as DbProduct[]).map((product) => {
    const translation =
      product.product_translations.find((t) => t.locale === contentLocale) ??
      product.product_translations[0];
    const name = translation?.name ?? product.slug;
    const description = translation?.description ?? null;
    const stock = product.product_variants
      .filter((v) => v.is_active)
      .reduce((sum, v) => sum + Number(v.stock_quantity ?? 0), 0);
    const flags: string[] = [];
    if (product.is_latest_drop) flags.push("Latest Drop");
    if (product.is_premium) flags.push("Premium");
    if (product.is_best_seller) flags.push("Best Seller");
    const { categoryId, categorySlug, categoryName } = resolvePrimaryCategoryFromLinks(
      product.product_categories,
      contentLocale,
    );
    const sortedMedia = [...(product.product_media ?? [])].sort((a, b) => {
      if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
      return a.sort_order - b.sort_order;
    });
    const imageUrl =
      sortedMedia.find((item) => item.kind === "image")?.public_url ??
      sortedMedia[0]?.public_url ??
      null;
    const modelMedia = sortedMedia.find((item) => item.kind === "glb");
    const modelGlbUrl = modelMedia?.public_url ?? null;
    const modelFileName = modelMedia?.public_url
      ? decodeURIComponent(modelMedia.public_url.split("/").pop() ?? "model")
      : null;

    return {
      id: product.id,
      slug: product.slug,
      name,
      description,
      status: formatProductStatus(product.status),
      statusRaw: product.status,
      price: formatSekAmount(Number(product.base_price), contentLocale),
      basePrice: Number(product.base_price),
      stock,
      unitsSold: Number(product.units_sold ?? 0),
      views: Number(product.view_count ?? 0),
      flags,
      isLatestDrop: product.is_latest_drop,
      isPremium: product.is_premium,
      isBestSeller: product.is_best_seller,
      isTemporarilyUnavailable: product.is_temporarily_unavailable,
      categoryId,
      categorySlug,
      categoryName,
      imageUrl,
      modelGlbUrl,
      modelFileName,
    };
  });

  return {
    source: "supabase",
    products,
    totalCount: products.length,
  };
}

export async function getAdminProductsData(locale: string): Promise<AdminProductsData> {
  if (shouldUseAdminMock()) {
    return {
      source: "mock",
      products: MOCK_ADMIN_PRODUCTS,
      totalCount: MOCK_ADMIN_PRODUCTS.length,
    };
  }
  try {
    return await fetchProducts(locale);
  } catch (error) {
    console.error("[admin] products fetch failed:", error);
    return {
      source: "mock",
      products: MOCK_ADMIN_PRODUCTS,
      totalCount: MOCK_ADMIN_PRODUCTS.length,
    };
  }
}
