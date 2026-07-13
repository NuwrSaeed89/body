import { subscribeStockNotification } from "@/lib/waiting-list/subscribe-stock-notification";
import { getStorefrontProductBySlug } from "@/lib/catalog/get-storefront-catalog";

type NotifyRequestBody = {
  email?: string;
  variantId?: string | null;
  size?: string | null;
  color?: string | null;
  userId?: string | null;
};

type RouteContext = {
  params: Promise<{ slug: string }>;
};

/**
 * Waiting list subscribe — maps to stock_notifications (email + product_id + variant_id).
 * POST { email, variantId?, size?, color?, userId? }
 */
export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const product = await getStorefrontProductBySlug(slug, "en");

  if (!product) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  let body: NotifyRequestBody;
  try {
    body = (await request.json()) as NotifyRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.email?.trim()) {
    return Response.json({ error: "Email is required" }, { status: 400 });
  }

  const result = await subscribeStockNotification({
    email: body.email,
    productId: product.id,
    slug,
    variantId: body.variantId ?? null,
    size: body.size ?? null,
    color: body.color ?? null,
    userId: body.userId ?? null,
  });

  if (!result.ok) {
    const status =
      result.error === "invalid_email"
        ? 400
        : result.error === "product_not_found"
          ? 404
          : result.error === "subscribe_failed"
            ? 500
            : 501;
    return Response.json(result, { status });
  }

  return Response.json(result);
}
