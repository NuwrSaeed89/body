import { hasSupabaseConfig, publicEnv } from "@/lib/env";
import { getProductBySlug } from "@/lib/shop-data";
import {
  addMockStockNotification,
  countWaitingForProduct,
} from "./mock-store";
import type {
  SubscribeStockNotificationInput,
  SubscribeStockNotificationResult,
} from "./types";
import { buildVariantKey } from "./variant-key";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidNotifyEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

export async function subscribeStockNotification(
  input: SubscribeStockNotificationInput,
): Promise<SubscribeStockNotificationResult> {
  const email = input.email.trim().toLowerCase();
  if (!isValidNotifyEmail(email)) {
    return {
      ok: false,
      alreadySubscribed: false,
      waitingCount: countWaitingForProduct(input.productId),
      error: "invalid_email",
    };
  }

  const product = getProductBySlug(input.slug);
  if (!product || product.id !== input.productId) {
    return {
      ok: false,
      alreadySubscribed: false,
      waitingCount: 0,
      error: "product_not_found",
    };
  }

  const variantId =
    input.variantId?.trim() ||
    buildVariantKey({
      productId: input.productId,
      size: input.size,
      color: input.color,
    });

  if (publicEnv.useMockData || !hasSupabaseConfig()) {
    const { alreadySubscribed } = addMockStockNotification({
      email,
      productId: input.productId,
      slug: input.slug,
      variantId,
      size: input.size?.trim() || null,
      color: input.color?.trim() || null,
      userId: input.userId ?? null,
    });

    const waitingCount = countWaitingForProduct(input.productId);
    const baseWaiting = product.stats.waitingCount;
    const displayCount = Math.max(baseWaiting, waitingCount);

    return {
      ok: true,
      alreadySubscribed,
      waitingCount: displayCount,
    };
  }

  // Supabase: insert into stock_notifications (maps to database/004_engagement.sql)
  // const supabase = createServiceRoleClient();
  // await supabase.from('stock_notifications').insert({ email, product_id, variant_id, user_id })
  return {
    ok: false,
    alreadySubscribed: false,
    waitingCount: product.stats.waitingCount,
    error: "supabase_not_wired",
  };
}
