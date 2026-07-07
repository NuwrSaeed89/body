import { fetchCartItems } from "@/lib/cart/cart-service";
import { requireCartUser } from "@/lib/cart/cart-api-guard";

export async function GET(request: Request) {
  const auth = await requireCartUser();
  if (auth instanceof Response) return auth;

  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") ?? "en";

  try {
    const items = await fetchCartItems(auth.userId, locale);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    return Response.json({ items, itemCount });
  } catch (error) {
    console.error("[cart] fetch failed:", error);
    return Response.json({ error: "Could not load cart" }, { status: 500 });
  }
}
