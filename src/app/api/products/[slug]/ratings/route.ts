import { getProductRatingState } from "@/lib/product-ratings/get-product-rating-state";
import { submitProductRating } from "@/lib/product-ratings/submit-product-rating";
import { getStorefrontProductBySlug } from "@/lib/catalog/get-storefront-catalog";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

type RatingRequestBody = {
  stars?: number;
  userId?: string | null;
};

/**
 * Product star ratings — maps to product_ratings (1–5, verified buyers only).
 * GET ?userId= — summary + eligibility
 * POST { stars, userId } — submit rating (one per buyer per product)
 */
export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const product = await getStorefrontProductBySlug(slug, "en");

  if (!product) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  const state = await getProductRatingState(slug, userId, product.id);
  if (!state) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  return Response.json({
    ok: true,
    productId: product.id,
    ...state,
  });
}

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const product = await getStorefrontProductBySlug(slug, "en");

  if (!product) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  let body: RatingRequestBody;
  try {
    body = (await request.json()) as RatingRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.stars == null || !body.userId?.trim()) {
    return Response.json({ error: "stars and userId are required" }, { status: 400 });
  }

  const result = await submitProductRating({
    userId: body.userId.trim(),
    productId: product.id,
    slug,
    stars: body.stars,
  });

  if (!result.ok) {
    const status =
      result.error === "invalid_stars"
        ? 400
        : result.error === "not_signed_in" || result.error === "not_purchased"
          ? 403
          : result.error === "already_rated"
            ? 409
            : result.error === "product_not_found"
              ? 404
              : 501;
    return Response.json(result, { status });
  }

  return Response.json(result);
}
