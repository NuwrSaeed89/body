import { requireCartUser } from "@/lib/cart/cart-api-guard";
import { placeCheckoutOrder } from "@/lib/orders/place-checkout-order";
import {
  getCheckoutPaymentAvailability,
  isOrderPaymentMethod,
  normalizeOrderPaymentMethod,
} from "@/lib/payment/payment-methods";
import { getPaymentConfigStatus } from "@/lib/payment/provider-env";

type PlaceOrderBody = {
  locale?: string;
  paymentMethod?: string;
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

  let body: PlaceOrderBody;
  try {
    body = (await request.json()) as PlaceOrderBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const locale = (body.locale ?? "en").trim() || "en";
  const shipping = body.shippingAddress;
  const rawPaymentMethod = body.paymentMethod?.trim();
  const paymentMethod = normalizeOrderPaymentMethod(
    rawPaymentMethod,
    rawPaymentMethod === "cod",
  );

  if (rawPaymentMethod && !isOrderPaymentMethod(rawPaymentMethod)) {
    return Response.json({ error: "Invalid payment method" }, { status: 400 });
  }

  const availability = getCheckoutPaymentAvailability(getPaymentConfigStatus());
  if (!availability[paymentMethod]) {
    return Response.json({ error: "Payment method is not available" }, { status: 400 });
  }

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
    const result = await placeCheckoutOrder({
      userId: auth.userId,
      locale,
      paymentMethod,
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
    console.error("[checkout] place order failed:", error);
    const message = error instanceof Error ? error.message : "Could not place order";
    const status =
      message.includes("empty") ||
      message.includes("required") ||
      message.includes("not available") ||
      message.includes("Invalid payment")
        ? 400
        : 409;
    return Response.json({ ok: false, error: message }, { status });
  }
}
