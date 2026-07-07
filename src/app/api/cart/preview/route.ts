import { previewCartItems } from "@/lib/cart/cart-service";
import { shouldUseCartMock } from "@/lib/cart/should-use-cart-mock";

type PreviewCartBody = {
  items?: { variantId?: string; quantity?: number }[];
};

export async function POST(request: Request) {
  if (shouldUseCartMock()) {
    return Response.json(
      { error: "Cart preview requires live Supabase. Set NEXT_PUBLIC_USE_MOCK_DATA=false." },
      { status: 503 },
    );
  }

  let body: PreviewCartBody;
  try {
    body = (await request.json()) as PreviewCartBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const entries = (body.items ?? [])
    .map((item) => ({
      variantId: item.variantId?.trim() ?? "",
      quantity: item.quantity ?? 0,
    }))
    .filter((item) => item.variantId && Number.isInteger(item.quantity) && item.quantity > 0);

  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") ?? "en";

  try {
    const items = await previewCartItems(entries, locale);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    return Response.json({ items, itemCount });
  } catch (error) {
    console.error("[cart] preview failed:", error);
    return Response.json({ error: "Could not preview cart" }, { status: 500 });
  }
}
