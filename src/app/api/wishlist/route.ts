import { requireWishlistUser } from "@/lib/wishlist/wishlist-api-guard";
import {
  addWishlistProduct,
  listWishlistProductIds,
  removeWishlistProduct,
} from "@/lib/wishlist/wishlist-service";

export async function GET() {
  const auth = await requireWishlistUser();
  if (auth instanceof Response) return auth;

  try {
    const productIds = await listWishlistProductIds(auth.userId);
    return Response.json({ productIds, count: productIds.length });
  } catch (error) {
    console.error("[wishlist] list failed:", error);
    return Response.json({ error: "Could not load wishlist" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireWishlistUser();
  if (auth instanceof Response) return auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const productId =
    typeof (body as { productId?: unknown }).productId === "string"
      ? (body as { productId: string }).productId.trim()
      : "";

  if (!productId) {
    return Response.json({ error: "productId is required" }, { status: 400 });
  }

  try {
    const result = await addWishlistProduct(auth.userId, productId);
    return Response.json(result, { status: 201 });
  } catch (error) {
    console.error("[wishlist] add failed:", error);
    return Response.json({ error: "Could not add to wishlist" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = await requireWishlistUser();
  if (auth instanceof Response) return auth;

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId")?.trim() ?? "";

  if (!productId) {
    return Response.json({ error: "productId is required" }, { status: 400 });
  }

  try {
    const result = await removeWishlistProduct(auth.userId, productId);
    return Response.json(result);
  } catch (error) {
    console.error("[wishlist] remove failed:", error);
    return Response.json({ error: "Could not remove from wishlist" }, { status: 500 });
  }
}
