import { removeCartItem, updateCartItemQuantity } from "@/lib/cart/cart-service";
import { requireCartUser } from "@/lib/cart/cart-api-guard";

type UpdateCartItemBody = {
  quantity?: number;
};

type RouteContext = {
  params: Promise<{ itemId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireCartUser();
  if (auth instanceof Response) return auth;

  const { itemId } = await context.params;
  const trimmedId = itemId?.trim();
  if (!trimmedId) {
    return Response.json({ error: "itemId is required" }, { status: 400 });
  }

  let body: UpdateCartItemBody;
  try {
    body = (await request.json()) as UpdateCartItemBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const quantity = body.quantity;
  if (quantity === undefined || !Number.isInteger(quantity) || quantity < 0) {
    return Response.json({ error: "quantity must be a non-negative integer" }, { status: 400 });
  }

  const locale = new URL(request.url).searchParams.get("locale") ?? "en";

  try {
    const result = await updateCartItemQuantity(auth.userId, trimmedId, quantity, locale);
    if (!result.ok) {
      const status =
        result.error === "out_of_stock"
          ? 409
          : result.error === "invalid_quantity"
            ? 400
            : 404;
      return Response.json(result, { status });
    }

    return Response.json(result);
  } catch (error) {
    console.error("[cart] update item failed:", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const auth = await requireCartUser();
  if (auth instanceof Response) return auth;

  const { itemId } = await context.params;
  const trimmedId = itemId?.trim();
  if (!trimmedId) {
    return Response.json({ error: "itemId is required" }, { status: 400 });
  }

  const locale = new URL(request.url).searchParams.get("locale") ?? "en";

  try {
    const result = await removeCartItem(auth.userId, trimmedId, locale);
    if (!result.ok) {
      return Response.json(result, { status: 404 });
    }

    return Response.json(result);
  } catch (error) {
    console.error("[cart] remove item failed:", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
