import "server-only";

import { cache } from "react";
import { getStorefrontProducts } from "@/lib/catalog/get-storefront-catalog";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  AccountActiveOrder,
  AccountProfileData,
  AccountRecommendedProduct,
} from "@/lib/account/types";

type DbOrder = {
  id: string;
  order_number: string;
  status: string;
  grand_total: number;
  currency: string;
  created_at: string;
};

type DbOrderItem = {
  product_id: string;
  product_name: string;
  color_code: string | null;
  size_code: string | null;
};

type DbProductMedia = {
  public_url: string;
};

function resolveBadgeLabel(
  badge: "new" | "limitedRelease" | "bestSeller" | undefined,
): string {
  if (badge === "new") return "NEW ARRIVAL";
  if (badge === "limitedRelease") return "LIMITED EDITION";
  if (badge === "bestSeller") return "BESTSELLER";
  return "RECOMMENDED";
}

export const getAccountDashboardData = cache(
  async (
    profile: AccountProfileData | null,
  ): Promise<{
    activeOrder: AccountActiveOrder | null;
    recommendedProducts: AccountRecommendedProduct[];
  }> => {
    if (!profile) {
      return { activeOrder: null, recommendedProducts: [] };
    }

    const supabase = createSupabaseAdminClient();

    const { data: latestOrderData } = await supabase
      .from("orders")
      .select("id, order_number, status, grand_total, currency, created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const latestOrder = (latestOrderData as DbOrder | null) ?? null;

    let activeOrder: AccountActiveOrder | null = null;

    if (latestOrder) {
      const { data: orderItemData } = await supabase
        .from("order_items")
        .select("product_id, product_name, color_code, size_code")
        .eq("order_id", latestOrder.id)
        .limit(1)
        .maybeSingle();

      const orderItem = (orderItemData as DbOrderItem | null) ?? null;
      let productImage: string | null = null;

      if (orderItem?.product_id) {
        const { data: mediaData } = await supabase
          .from("product_media")
          .select("public_url")
          .eq("product_id", orderItem.product_id)
          .eq("kind", "image")
          .order("is_primary", { ascending: false })
          .order("sort_order", { ascending: true })
          .limit(1)
          .maybeSingle();

        productImage = (mediaData as DbProductMedia | null)?.public_url ?? null;
      }

      activeOrder = {
        id: latestOrder.id,
        orderNumber: latestOrder.order_number,
        status: latestOrder.status,
        total: Number(latestOrder.grand_total ?? 0),
        currency: latestOrder.currency ?? profile.currency,
        createdAt: latestOrder.created_at,
        itemName: orderItem?.product_name ?? null,
        itemColorCode: orderItem?.color_code ?? null,
        itemSizeCode: orderItem?.size_code ?? null,
        productImage,
      };
    }

    const { data: recentOrdersData } = await supabase
      .from("orders")
      .select("id")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(6);

    const orderIds = (recentOrdersData ?? []).map((row) => row.id as string);
    let purchasedProductIds = new Set<string>();

    if (orderIds.length > 0) {
      const { data: itemsData } = await supabase
        .from("order_items")
        .select("product_id")
        .in("order_id", orderIds);

      purchasedProductIds = new Set(
        (itemsData ?? [])
          .map((row) => row.product_id as string | null)
          .filter((value): value is string => !!value),
      );
    }

    const catalog = await getStorefrontProducts(profile.locale);
    const personalized = catalog.filter((product) => !purchasedProductIds.has(product.id));
    const picks = (personalized.length > 0 ? personalized : catalog).slice(0, 4);

    const recommendedProducts: AccountRecommendedProduct[] = picks.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      priceSek: product.priceSek,
      image: product.image,
      badge: resolveBadgeLabel(product.badgeKey),
    }));

    return { activeOrder, recommendedProducts };
  },
);
