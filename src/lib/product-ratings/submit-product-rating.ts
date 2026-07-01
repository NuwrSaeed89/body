import { hasSupabaseConfig, publicEnv } from "@/lib/env";
import { getProductBySlug } from "@/lib/shop-data";
import { findVerifiedPurchase } from "./mock-verified-purchase";
import {
  addMockProductRating,
  getProductRatingSummary,
  getUserProductRating,
} from "./mock-store";
import type { SubmitProductRatingInput, SubmitProductRatingResult } from "./types";

export function isValidStarRating(stars: number): boolean {
  return Number.isInteger(stars) && stars >= 1 && stars <= 5;
}

export async function submitProductRating(
  input: SubmitProductRatingInput,
): Promise<SubmitProductRatingResult> {
  const product = getProductBySlug(input.slug);
  const summary = getProductRatingSummary(input.productId);

  if (!product || product.id !== input.productId) {
    return { ok: false, error: "product_not_found", summary };
  }

  if (!isValidStarRating(input.stars)) {
    return { ok: false, error: "invalid_stars", summary };
  }

  if (!input.userId?.trim()) {
    return { ok: false, error: "not_signed_in", summary };
  }

  const existing = getUserProductRating(input.userId, input.productId);
  if (existing) {
    return {
      ok: false,
      error: "already_rated",
      summary,
      userRating: existing.stars,
    };
  }

  const purchase = findVerifiedPurchase(input.userId, input.productId);
  if (!purchase.ok) {
    return {
      ok: false,
      error: purchase.reason,
      summary,
    };
  }

  if (publicEnv.useMockData || !hasSupabaseConfig()) {
    const { alreadyRated } = addMockProductRating({
      userId: input.userId,
      productId: input.productId,
      orderId: purchase.orderId,
      stars: input.stars,
    });

    if (alreadyRated) {
      const rated = getUserProductRating(input.userId, input.productId);
      return {
        ok: false,
        error: "already_rated",
        summary: getProductRatingSummary(input.productId),
        userRating: rated?.stars,
      };
    }

    return {
      ok: true,
      alreadyRated: false,
      summary: getProductRatingSummary(input.productId),
      userRating: input.stars,
    };
  }

  // Supabase: insert into product_ratings (database/004_engagement.sql)
  return { ok: false, error: "supabase_not_wired", summary };
}
