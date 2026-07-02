import {
  fetchCartItems,
  resolveProfileIdByEmail,
} from "@/lib/cart/cart-service";
import { shouldUseCartMock } from "@/lib/cart/should-use-cart-mock";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email")?.trim().toLowerCase();
  const locale = searchParams.get("locale") ?? "en";

  if (!email) {
    return Response.json({ error: "Email is required" }, { status: 400 });
  }

  if (shouldUseCartMock()) {
    return Response.json({ items: [], itemCount: 0, mock: true });
  }

  try {
    const profileId = await resolveProfileIdByEmail(email);
    if (!profileId) {
      return Response.json({ items: [], itemCount: 0, profileNotFound: true });
    }

    const items = await fetchCartItems(profileId, locale);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    return Response.json({ items, itemCount, profileId });
  } catch (error) {
    console.error("[cart] fetch failed:", error);
    return Response.json({ error: "Could not load cart" }, { status: 500 });
  }
}
