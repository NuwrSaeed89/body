import { requireCartUser } from "@/lib/cart/cart-api-guard";
import { placeCodOrder } from "@/lib/orders/place-cod-order";

type PlaceCodBody = {
  locale?: string;
  shippingAddress?: {
    fullName?: string;
    line1?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
  };
};

export async function POST(request: Request) {
  const auth = await requireCartUser();
  if (auth instanceof Response) return auth;

  let body: PlaceCodBody;
  try {
    body = (await request.json()) as PlaceCodBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const locale = (body.locale ?? "en").trim() || "en";
  const shipping = body.shippingAddress;

  if (!shipping?.fullName?.trim()) {
    return Response.json({ error: "fullName is required" }, { status: 400 });
  }
  if (!shipping?.line1?.trim()) {
    return Response.json({ error: "address line is required" }, { status: 400 });
  }
  if (!shipping?.city?.trim()) {
    return Response.json({ error: "city is required" }, { status: 400 });
  }
  if (!shipping?.postalCode?.trim()) {
    return Response.json({ error: "postalCode is required" }, { status: 400 });
  }
  if (!shipping?.country?.trim()) {
    return Response.json({ error: "country is required" }, { status: 400 });
  }

  try {
    const result = await placeCodOrder({
      userId: auth.userId,
      locale,
      shippingAddress: {
        fullName: shipping.fullName.trim(),
        line1: shipping.line1.trim(),
        city: shipping.city.trim(),
        postalCode: shipping.postalCode.trim(),
        country: shipping.country.trim(),
        phone: shipping.phone?.trim() || "",
      },
    });

    return Response.json({ ok: true, ...result });
  } catch (error) {
    console.error("[checkout] place COD order failed:", error);
    const message = error instanceof Error ? error.message : "Could not place order";
    const status = message.includes("empty") || message.includes("required") ? 400 : 409;
    return Response.json({ ok: false, error: message }, { status });
  }
}
