import {
  addItemToCart,
  resolveProfileIdByEmail,
} from "@/lib/cart/cart-service";
import { shouldUseCartMock } from "@/lib/cart/should-use-cart-mock";

type AddCartItemBody = {
  email?: string;
  variantId?: string;
  quantity?: number;
};

export async function POST(request: Request) {
  let body: AddCartItemBody;
  try {
    body = (await request.json()) as AddCartItemBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const variantId = body.variantId?.trim();
  const quantity = body.quantity ?? 1;

  if (!email || !variantId) {
    return Response.json({ error: "Email and variantId are required" }, { status: 400 });
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    return Response.json({ error: "Quantity must be at least 1" }, { status: 400 });
  }

  if (shouldUseCartMock()) {
    return Response.json({ ok: false, error: "mock_mode" }, { status: 501 });
  }

  try {
    const profileId = await resolveProfileIdByEmail(email);
    if (!profileId) {
      return Response.json({ ok: false, error: "profile_not_found" }, { status: 404 });
    }

    const result = await addItemToCart(profileId, variantId, quantity);
    if (!result.ok) {
      return Response.json(result, { status: result.error === "out_of_stock" ? 409 : 404 });
    }

    return Response.json(result);
  } catch (error) {
    console.error("[cart] add item failed:", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
