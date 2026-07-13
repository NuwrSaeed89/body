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
import { insertStockNotification } from "./waiting-list-service";

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

  const mockProduct = getProductBySlug(input.slug);
  if (mockProduct && mockProduct.id !== input.productId) {
    return {
      ok: false,
      alreadySubscribed: false,
      waitingCount: 0,
      error: "product_not_found",
    };
  }

  if (!input.productId?.trim()) {
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
    const baseWaiting = mockProduct?.stats.waitingCount ?? 0;
    const displayCount = Math.max(baseWaiting, waitingCount);

    return {
      ok: true,
      alreadySubscribed,
      waitingCount: displayCount,
    };
  }

  try {
    const result = await insertStockNotification({
      email,
      productId: input.productId,
      variantId: input.variantId,
      userId: input.userId,
    });

    return {
      ok: true,
      alreadySubscribed: result.alreadySubscribed,
      waitingCount: result.waitingCount,
    };
  } catch (error) {
    console.error("[waiting-list] subscribe failed:", error);
    return {
      ok: false,
      alreadySubscribed: false,
      waitingCount: 0,
      error: "subscribe_failed",
    };
  }
}
