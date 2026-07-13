import { isCurrency, type Currency } from "@/lib/currency";
import { formatAdminAmount } from "./format";
import type { AdminProductsData } from "./list-types";
import { MOCK_ADMIN_PRODUCTS } from "./mock-list-data";
import { resolvePrimaryCategoryFromLinks } from "./products/resolve-category";
import { shouldUseAdminMock } from "./should-use-mock";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  fetchWishlistLikeCounts,
  reconcileProductLikeCounts,
} from "@/lib/wishlist/wishlist-service";
import {
  fetchWaitingCounts,
  reconcileProductWaitingCounts,
} from "@/lib/waiting-list/waiting-list-service";

type DbProduct = {
  id: string;
  slug: string;
  status: string;
  base_price: number;
  currency: string;
  units_sold: number;
  view_count: number;
  like_count: number;
  waiting_count: number;
  is_latest_drop: boolean;
  is_premium: boolean;
  is_best_seller: boolean;
  is_temporarily_unavailable: boolean;
  product_translations: { name: string; locale: string; description: string | null }[];
  low_stock_threshold: number;
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
  product_media: {
    id: string;
    public_url: string;
    is_primary: boolean;
    sort_order: number;
    kind: string;
  }[];
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
      currency,
      units_sold,
      view_count,
      like_count,
      waiting_count,
      is_latest_drop,
      is_premium,
      is_best_seller,
      is_temporarily_unavailable,
      low_stock_threshold,
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
      product_media(id, public_url, is_primary, sort_order, kind)
    `,
    )
    .eq("product_translations.locale", contentLocale)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const productRows = (data ?? []) as unknown as DbProduct[];
  const productIds = productRows.map((product) => product.id);

  // Authoritative likes from wishlists; also reconcile denormalized like_count.
  let likeCountByProductId = new Map<string, number>();
  let likesSynced = false;
  try {
    likeCountByProductId = await fetchWishlistLikeCounts(productIds);
    await reconcileProductLikeCounts(productIds);
    likesSynced = true;
  } catch (syncError) {
    console.error("[admin] wishlist like_count sync failed:", syncError);
  }

  // Authoritative waiting list from stock_notifications → products.waiting_count.
  let waitingCountByProductId = new Map<string, number>();
  let waitingSynced = false;
  try {
    waitingCountByProductId = await fetchWaitingCounts(productIds);
    await reconcileProductWaitingCounts(productIds);
    waitingSynced = true;
  } catch (syncError) {
    console.error("[admin] waiting_count sync failed:", syncError);
  }

  const ratingByProductId = new Map<string, { average: number; count: number }>();
  if (productIds.length > 0) {
    const { data: ratingRows, error: ratingError } = await supabase
      .from("product_ratings")
      .select("product_id, stars")
      .in("product_id", productIds);

    if (ratingError) throw ratingError;

    const totals = new Map<string, { sum: number; count: number }>();
    for (const row of ratingRows ?? []) {
      const productId = String((row as { product_id: string }).product_id);
      const stars = Number((row as { stars: number }).stars);
      const current = totals.get(productId) ?? { sum: 0, count: 0 };
      current.sum += stars;
      current.count += 1;
      totals.set(productId, current);
    }

    for (const [productId, total] of totals) {
      ratingByProductId.set(productId, {
        average: Math.round((total.sum / total.count) * 10) / 10,
        count: total.count,
      });
    }
  }

  const products = productRows.map((product) => {
    const translation =
      product.product_translations.find((t) => t.locale === contentLocale) ??
      product.product_translations[0];
    const name = translation?.name ?? product.slug;
    const description = translation?.description ?? null;
    const activeVariants = product.product_variants.filter((v) => v.is_active);
    const stock = activeVariants.reduce((sum, v) => sum + Number(v.stock_quantity ?? 0), 0);
    const variantCount = activeVariants.length;
    const lowStockThreshold = Number(product.low_stock_threshold ?? 5);
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
    const imageItems = sortedMedia
      .filter((item) => item.kind === "image")
      .map((item) => ({
        id: item.id,
        publicUrl: item.public_url,
        fileName: decodeURIComponent(item.public_url.split("/").pop() ?? "image"),
        isPrimary: item.is_primary,
        sortOrder: item.sort_order,
      }));
    const imageUrl = imageItems.find((item) => item.isPrimary)?.publicUrl ?? imageItems[0]?.publicUrl ?? null;
    const modelMedia = sortedMedia.find((item) => item.kind === "glb");
    const modelGlbUrl = modelMedia?.public_url ?? null;
    const modelFileName = modelMedia?.public_url
      ? decodeURIComponent(modelMedia.public_url.split("/").pop() ?? "model")
      : null;
    const rating = ratingByProductId.get(product.id) ?? { average: 0, count: 0 };
    const likes = likesSynced
      ? (likeCountByProductId.get(product.id) ?? 0)
      : Number(product.like_count ?? 0);
    const waitingCount = waitingSynced
      ? (waitingCountByProductId.get(product.id) ?? 0)
      : Number(product.waiting_count ?? 0);

    return {
      id: product.id,
      slug: product.slug,
      name,
      description,
      status: formatProductStatus(product.status),
      statusRaw: product.status,
      price: formatAdminAmount(
        Number(product.base_price),
        contentLocale,
        isCurrency(product.currency) ? (product.currency as Currency) : "SEK",
      ),
      basePrice: Number(product.base_price),
      stock,
      lowStockThreshold,
      variantCount,
      unitsSold: Number(product.units_sold ?? 0),
      views: Number(product.view_count ?? 0),
      likes,
      waitingCount,
      ratingAverage: rating.average,
      ratingCount: rating.count,
      flags,
      isLatestDrop: product.is_latest_drop,
      isPremium: product.is_premium,
      isBestSeller: product.is_best_seller,
      isTemporarilyUnavailable: product.is_temporarily_unavailable,
      categoryId,
      categorySlug,
      categoryName,
      imageUrl,
      images: imageItems,
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
