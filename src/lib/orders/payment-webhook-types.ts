import type { OrderPaymentMethod } from "@/lib/payment/payment-methods";
import type { OrderConfirmationEmailData } from "@/lib/emails/order-confirmation-types";

export const PAYMENT_WEBHOOK_EVENTS = [
  "payment.succeeded",
  "payment.failed",
  "payment.refunded",
] as const;

export type PaymentWebhookEvent = (typeof PAYMENT_WEBHOOK_EVENTS)[number];

export type PaymentWebhookPayload = {
  event: PaymentWebhookEvent;
  providerPaymentId: string;
  /** Prefer UUID when available */
  orderId?: string;
  orderNumber?: string;
  paymentMethod?: OrderPaymentMethod;
  occurredAt?: string;
  /** Required for payment.succeeded email when not loaded from DB */
  order?: OrderConfirmationEmailData;
  reason?: string;
};

export type PaymentWebhookResult = {
  ok: boolean;
  event: PaymentWebhookEvent;
  orderId: string;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  alreadyProcessed?: boolean;
  emailSent?: boolean;
  emailMode?: "resend" | "log";
  emailMessageId?: string;
  emailError?: string;
  error?: string;
};
