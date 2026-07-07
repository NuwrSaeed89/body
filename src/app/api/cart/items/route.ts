import { addItemToCart } from "@/lib/cart/cart-service";
import { requireCartUser } from "@/lib/cart/cart-api-guard";

type AddCartItemBody = {
  variantId?: string;
  quantity?: number;
};

export async function POST(request: Request) {
  const auth = await requireCartUser();
  if (auth instanceof Response) return auth;

  let body: AddCartItemBody;
  try {
    body = (await request.json()) as AddCartItemBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const variantId = body.variantId?.trim();
  const quantity = body.quantity ?? 1;

  if (!variantId) {
    return Response.json({ error: "variantId is required" }, { status: 400 });
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    return Response.json({ error: "Quantity must be at least 1" }, { status: 400 });
  }

  try {
    const result = await addItemToCart(auth.userId, variantId, quantity);
    if (!result.ok) {
      return Response.json(result, { status: result.error === "out_of_stock" ? 409 : 404 });
    }

    return Response.json(result);
  } catch (error) {
    console.error("[cart] add item failed:", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
