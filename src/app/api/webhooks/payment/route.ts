import { buildSampleOrderConfirmationData } from "@/lib/emails/sample-order-confirmation";
import { onPaymentSucceeded } from "@/lib/orders/on-payment-succeeded";
import type { OrderConfirmationEmailData } from "@/lib/emails/order-confirmation-types";
import { publicEnv, serverEnv } from "@/lib/env";

type PaymentWebhookBody = {
  event?: string;
  providerPaymentId?: string;
  paidAt?: string;
  order?: OrderConfirmationEmailData;
};

function isPaymentSucceededPayload(body: PaymentWebhookBody): body is Required<PaymentWebhookBody> & {
  order: OrderConfirmationEmailData;
} {
  return (
    body.event === "payment.succeeded" &&
    typeof body.providerPaymentId === "string" &&
    Boolean(body.order?.orderNumber && body.order?.customerEmail)
  );
}

/**
 * Payment gateway webhook (Phase 4).
 * POST with { event: "payment.succeeded", providerPaymentId, paidAt?, order: OrderConfirmationEmailData }
 *
 * Signature verification (Stripe/Klarna) — add when credentials are available.
 */
export async function POST(request: Request) {
  let body: PaymentWebhookBody;
  try {
    body = (await request.json()) as PaymentWebhookBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isPaymentSucceededPayload(body)) {
    return Response.json({ error: "Unsupported or invalid webhook event" }, { status: 400 });
  }

  const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (webhookSecret && serverEnv.nodeEnv === "production") {
    const signature = request.headers.get("x-mbody-webhook-signature");
    if (signature !== webhookSecret) {
      return Response.json({ error: "Invalid webhook signature" }, { status: 401 });
    }
  }

  const paidAt = body.paidAt ?? new Date().toISOString();
  const result = await onPaymentSucceeded(body.order, {
    orderId: body.order.orderNumber,
    providerPaymentId: body.providerPaymentId,
    paymentMethod: body.order.paymentMethod,
    paidAt,
  });

  return Response.json(result);
}

/** Dev helper — trigger sample confirmation without a real payment provider. */
export async function GET() {
  if (serverEnv.nodeEnv === "production") {
    return Response.json({ error: "Not available" }, { status: 404 });
  }

  const sample = buildSampleOrderConfirmationData("en");
  const result = await onPaymentSucceeded(sample, {
    orderId: sample.orderNumber,
    providerPaymentId: "pi_mock_dev",
    paymentMethod: sample.paymentMethod,
    paidAt: new Date().toISOString(),
  });

  return Response.json({
    message: "Sample payment.succeeded processed",
    previewUrl: `${publicEnv.appUrl}/api/dev/emails/order-confirmation?locale=en`,
    result,
  });
}
