import { applyPaymentWebhook } from "@/lib/orders/apply-payment-webhook";
import type { OrderConfirmationEmailData } from "@/lib/emails/order-confirmation-types";
import type { PaymentWebhookResult } from "@/lib/orders/payment-webhook-types";

export type PaymentSucceededEvent = {
  orderId: string;
  providerPaymentId: string;
  paymentMethod: OrderConfirmationEmailData["paymentMethod"];
  paidAt: string;
  orderNumber?: string;
};

export type PaymentSucceededResult = {
  orderId: string;
  orderNumber?: string;
  orderStatus: string;
  paymentStatus: string;
  emailSent: boolean;
  emailMode?: "resend" | "log";
  emailMessageId?: string;
  emailError?: string;
  alreadyProcessed?: boolean;
};

/**
 * Phase 4 entry point — call from payment gateway webhook after capture succeeds.
 * Updates orders.status → paid (triggers units_sold) + order_payments → captured, then emails.
 */
export async function onPaymentSucceeded(
  emailData: OrderConfirmationEmailData,
  event: PaymentSucceededEvent,
): Promise<PaymentSucceededResult> {
  const result: PaymentWebhookResult = await applyPaymentWebhook({
    event: "payment.succeeded",
    providerPaymentId: event.providerPaymentId,
    orderId: event.orderId,
    orderNumber: event.orderNumber ?? emailData.orderNumber,
    paymentMethod: event.paymentMethod,
    occurredAt: event.paidAt,
    order: emailData,
  });

  if (!result.ok) {
    throw new Error(result.error ?? "payment.succeeded failed");
  }

  return {
    orderId: result.orderId,
    orderNumber: result.orderNumber,
    orderStatus: result.orderStatus,
    paymentStatus: result.paymentStatus,
    emailSent: Boolean(result.emailSent),
    emailMode: result.emailMode,
    emailMessageId: result.emailMessageId,
    emailError: result.emailError,
    alreadyProcessed: result.alreadyProcessed,
  };
}

export async function onPaymentFailed(input: {
  orderId?: string;
  orderNumber?: string;
  providerPaymentId: string;
  reason?: string;
  occurredAt?: string;
}): Promise<PaymentWebhookResult> {
  return applyPaymentWebhook({
    event: "payment.failed",
    providerPaymentId: input.providerPaymentId,
    orderId: input.orderId,
    orderNumber: input.orderNumber,
    occurredAt: input.occurredAt,
    reason: input.reason,
  });
}

export async function onPaymentRefunded(input: {
  orderId?: string;
  orderNumber?: string;
  providerPaymentId: string;
  reason?: string;
  occurredAt?: string;
}): Promise<PaymentWebhookResult> {
  return applyPaymentWebhook({
    event: "payment.refunded",
    providerPaymentId: input.providerPaymentId,
    orderId: input.orderId,
    orderNumber: input.orderNumber,
    occurredAt: input.occurredAt,
    reason: input.reason,
  });
}
