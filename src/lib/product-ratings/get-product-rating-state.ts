import { hasSupabaseConfig, publicEnv } from "@/lib/env";
import { fetchProductRatingSummary } from "@/lib/catalog/fetch-product-ratings";
import { shouldUseStorefrontMock } from "@/lib/catalog/should-use-storefront-mock";
import { getProductBySlug } from "@/lib/shop-data";
import { findVerifiedPurchase } from "./mock-verified-purchase";
import { getProductRatingSummary, getUserProductRating } from "./mock-store";
import type { ProductRatingState, RatingEligibility } from "./types";

export async function getProductRatingState(
  slug: string,
  userId?: string | null,
  productId?: string,
): Promise<ProductRatingState | null> {
  const resolvedId = productId ?? getProductBySlug(slug)?.id;
  if (!resolvedId) return null;

  const summary =
    shouldUseStorefrontMock() || !hasSupabaseConfig()
      ? getProductRatingSummary(resolvedId)
      : await fetchProductRatingSummary(resolvedId).catch(() =>
          getProductRatingSummary(resolvedId),
        );

  const existing = userId ? getUserProductRating(userId, resolvedId) : undefined;

  let eligibility: RatingEligibility;
  if (existing) {
    eligibility = { canRate: false, reason: "already_rated" };
  } else {
    const purchase = findVerifiedPurchase(userId, resolvedId);
    eligibility = purchase.ok
      ? { canRate: true, orderId: purchase.orderId }
      : { canRate: false, reason: purchase.reason };
  }

  return {
    summary,
    userRating: existing?.stars ?? null,
    eligibility,
  };
}
