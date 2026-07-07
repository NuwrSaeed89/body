import { mergeGuestCartItems } from "@/lib/cart/cart-service";
import { requireCartUser } from "@/lib/cart/cart-api-guard";

type MergeCartBody = {
  items?: { variantId?: string; quantity?: number }[];
};

export async function POST(request: Request) {
  const auth = await requireCartUser();
  if (auth instanceof Response) return auth;

  let body: MergeCartBody;
  try {
    body = (await request.json()) as MergeCartBody;
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
    const result = await mergeGuestCartItems(auth.userId, entries, locale);
    if (!result.ok) {
      return Response.json(result, { status: 500 });
    }

    return Response.json(result);
  } catch (error) {
    console.error("[cart] merge failed:", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
