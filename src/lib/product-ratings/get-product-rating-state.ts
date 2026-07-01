import { getProductBySlug } from "@/lib/shop-data";
import { findVerifiedPurchase } from "./mock-verified-purchase";
import { getProductRatingSummary, getUserProductRating } from "./mock-store";
import type { ProductRatingState, RatingEligibility } from "./types";

export function getProductRatingState(
  slug: string,
  userId?: string | null,
): ProductRatingState | null {
  const product = getProductBySlug(slug);
  if (!product) return null;

  const summary = getProductRatingSummary(product.id);
  const existing = userId ? getUserProductRating(userId, product.id) : undefined;

  let eligibility: RatingEligibility;
  if (existing) {
    eligibility = { canRate: false, reason: "already_rated" };
  } else {
    const purchase = findVerifiedPurchase(userId, product.id);
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
