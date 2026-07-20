import { timingSafeEqual } from "node:crypto";
import { buildSampleOrderConfirmationData } from "@/lib/emails/sample-order-confirmation";
import type { OrderConfirmationEmailData } from "@/lib/emails/order-confirmation-types";
import {
  onPaymentFailed,
  onPaymentRefunded,
  onPaymentSucceeded,
} from "@/lib/orders/on-payment-succeeded";
import { applyPaymentWebhook } from "@/lib/orders/apply-payment-webhook";
import {
  PAYMENT_WEBHOOK_EVENTS,
  type PaymentWebhookEvent,
  type PaymentWebhookPayload,
} from "@/lib/orders/payment-webhook-types";
import { publicEnv, serverEnv } from "@/lib/env";

type PaymentWebhookBody = {
  event?: string;
  providerPaymentId?: string;
  orderId?: string;
  orderNumber?: string;
  paymentMethod?: OrderConfirmationEmailData["paymentMethod"];
  paidAt?: string;
  failedAt?: string;
  refundedAt?: string;
  occurredAt?: string;
  reason?: string;
  order?: OrderConfirmationEmailData;
};

function isWebhookEvent(value: string | undefined): value is PaymentWebhookEvent {
  return Boolean(value && (PAYMENT_WEBHOOK_EVENTS as readonly string[]).includes(value));
}

function verifyWebhookSignature(request: Request): boolean {
  const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    // Allow unsigned webhooks in non-production for local/dev testing.
    return serverEnv.nodeEnv !== "production";
  }

  const signature = request.headers.get("x-mbody-webhook-signature")?.trim();
  if (!signature) return false;

  try {
    const expected = Buffer.from(webhookSecret);
    const provided = Buffer.from(signature);
    if (expected.length !== provided.length) return false;
    return timingSafeEqual(expected, provided);
  } catch {
    return false;
  }
}

function parsePayload(body: PaymentWebhookBody): PaymentWebhookPayload | null {
  if (!isWebhookEvent(body.event)) return null;
  if (typeof body.providerPaymentId !== "string" || !body.providerPaymentId.trim()) {
    return null;
  }

  const occurredAt =
    body.occurredAt ??
    body.paidAt ??
    body.failedAt ??
    body.refundedAt ??
    new Date().toISOString();

  return {
    event: body.event,
    providerPaymentId: body.providerPaymentId.trim(),
    orderId: body.orderId?.trim() || undefined,
    orderNumber: body.orderNumber?.trim() || body.order?.orderNumber,
    paymentMethod: body.paymentMethod ?? body.order?.paymentMethod,
    occurredAt,
    reason: body.reason,
    order: body.order,
  };
}

/**
 * Payment gateway webhook (Phase 4).
 *
 * POST body:
 * {
 *   event: "payment.succeeded" | "payment.failed" | "payment.refunded",
 *   providerPaymentId: string,
 *   orderId?: uuid,
 *   orderNumber?: string,
 *   paymentMethod?: "card" | "klarna" | ...,
 *   occurredAt?: iso,
 *   reason?: string,
 *   order?: OrderConfirmationEmailData  // optional; used for confirmation email
 * }
 *
 * Header (when PAYMENT_WEBHOOK_SECRET is set):
 *   x-mbody-webhook-signature: <secret>
 */
export async function POST(request: Request) {
  if (!verifyWebhookSignature(request)) {
    return Response.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  let body: PaymentWebhookBody;
  try {
    body = (await request.json()) as PaymentWebhookBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const payload = parsePayload(body);
  if (!payload) {
    return Response.json(
      {
        error: "Unsupported or invalid webhook event",
        supported: PAYMENT_WEBHOOK_EVENTS,
      },
      { status: 400 },
    );
  }

  try {
    if (payload.event === "payment.succeeded") {
      if (payload.order?.orderNumber && payload.order?.customerEmail) {
        const result = await onPaymentSucceeded(payload.order, {
          orderId: payload.orderId ?? payload.order.orderNumber,
          orderNumber: payload.orderNumber ?? payload.order.orderNumber,
          providerPaymentId: payload.providerPaymentId,
          paymentMethod: payload.paymentMethod ?? payload.order.paymentMethod,
          paidAt: payload.occurredAt ?? new Date().toISOString(),
        });
        return Response.json({ ok: true, ...result });
      }

      const result = await applyPaymentWebhook(payload);
      if (!result.ok) {
        return Response.json(result, { status: 404 });
      }
      return Response.json(result);
    }

    if (payload.event === "payment.failed") {
      const result = await onPaymentFailed({
        orderId: payload.orderId,
        orderNumber: payload.orderNumber,
        providerPaymentId: payload.providerPaymentId,
        reason: payload.reason,
        occurredAt: payload.occurredAt,
      });
      if (!result.ok) {
        return Response.json(result, { status: 404 });
      }
      return Response.json(result);
    }

    const result = await onPaymentRefunded({
      orderId: payload.orderId,
      orderNumber: payload.orderNumber,
      providerPaymentId: payload.providerPaymentId,
      reason: payload.reason,
      occurredAt: payload.occurredAt,
    });
    if (!result.ok) {
      return Response.json(result, { status: 404 });
    }
    return Response.json(result);
  } catch (error) {
    console.error("[webhooks/payment] failed:", error);
    const message = error instanceof Error ? error.message : "Webhook processing failed";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}

/** Dev helper — trigger sample confirmation without a real payment provider. */
export async function GET(request: Request) {
  if (serverEnv.nodeEnv === "production") {
    return Response.json({ error: "Not available" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const eventParam = searchParams.get("event") ?? "payment.succeeded";
  const event = isWebhookEvent(eventParam) ? eventParam : "payment.succeeded";

  if (event === "payment.succeeded") {
    const sample = buildSampleOrderConfirmationData("en");
    const result = await onPaymentSucceeded(sample, {
      orderId: sample.orderNumber,
      orderNumber: sample.orderNumber,
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

  const result = await applyPaymentWebhook({
    event,
    providerPaymentId: "pi_mock_dev",
    orderNumber: "MB-MOCK",
    occurredAt: new Date().toISOString(),
    reason: "dev_sample",
  });

  return Response.json({
    message: `Sample ${event} processed (mock/order lookup)`,
    result,
  });
}
