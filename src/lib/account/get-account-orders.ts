import "server-only";

import { cache } from "react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AccountOrderListItem } from "@/lib/account/types";

type DbOrder = {
  id: string;
  order_number: string;
  status: string;
  grand_total: number;
  currency: string;
  created_at: string;
};

type DbOrderItem = {
  order_id: string;
  product_id: string;
  product_name: string;
};

type DbProductMedia = {
  product_id: string;
  public_url: string;
};

export const getAccountOrders = cache(
  async (userId: string): Promise<AccountOrderListItem[]> => {
    const supabase = createSupabaseAdminClient();

    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select("id, order_number, status, grand_total, currency, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.error("[account] orders fetch failed:", ordersError);
      return [];
    }

    const orders = (ordersData ?? []) as DbOrder[];
    if (orders.length === 0) return [];

    const orderIds = orders.map((order) => order.id);
    const { data: itemsData } = await supabase
      .from("order_items")
      .select("order_id, product_id, product_name")
      .in("order_id", orderIds);

    const items = (itemsData ?? []) as DbOrderItem[];
    const itemsByOrder = new Map<string, DbOrderItem[]>();
    const productIds = new Set<string>();

    for (const item of items) {
      const list = itemsByOrder.get(item.order_id) ?? [];
      list.push(item);
      itemsByOrder.set(item.order_id, list);
      if (item.product_id) productIds.add(item.product_id);
    }

    const imageByProduct = new Map<string, string>();
    if (productIds.size > 0) {
      const { data: mediaData } = await supabase
        .from("product_media")
        .select("product_id, public_url")
        .in("product_id", Array.from(productIds))
        .eq("kind", "image")
        .order("is_primary", { ascending: false })
        .order("sort_order", { ascending: true });

      for (const media of (mediaData ?? []) as DbProductMedia[]) {
        if (!imageByProduct.has(media.product_id)) {
          imageByProduct.set(media.product_id, media.public_url);
        }
      }
    }

    return orders.map((order) => {
      const orderItems = itemsByOrder.get(order.id) ?? [];
      const firstItem = orderItems[0] ?? null;

      return {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        total: Number(order.grand_total ?? 0),
        currency: order.currency,
        createdAt: order.created_at,
        itemCount: orderItems.length,
        firstItemName: firstItem?.product_name ?? null,
        firstItemImage: firstItem?.product_id ? imageByProduct.get(firstItem.product_id) ?? null : null,
      };
    });
  },
);
