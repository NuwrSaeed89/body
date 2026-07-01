export type ProductRatingRecord = {
  id: string;
  userId: string;
  productId: string;
  orderId: string;
  stars: number;
  createdAt: string;
};

export type ProductRatingSummary = {
  average: number;
  count: number;
};

export type RatingEligibility =
  | { canRate: true; orderId: string }
  | { canRate: false; reason: "not_signed_in" | "not_purchased" | "already_rated" };

export type SubmitProductRatingInput = {
  userId: string;
  productId: string;
  slug: string;
  stars: number;
};

export type SubmitProductRatingResult =
  | {
      ok: true;
      alreadyRated: false;
      summary: ProductRatingSummary;
      userRating: number;
    }
  | {
      ok: false;
      error:
        | "invalid_stars"
        | "not_signed_in"
        | "not_purchased"
        | "already_rated"
        | "product_not_found"
        | "supabase_not_wired";
      summary: ProductRatingSummary;
      userRating?: number;
    };

export type ProductRatingState = {
  summary: ProductRatingSummary;
  userRating: number | null;
  eligibility: RatingEligibility;
};
