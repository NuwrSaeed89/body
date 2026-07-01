import { sendOrderConfirmationEmail } from "@/lib/emails/send-order-confirmation";
import type { OrderConfirmationEmailData } from "@/lib/emails/order-confirmation-types";
import { publicEnv } from "@/lib/env";

export type PaymentSucceededEvent = {
  orderId: string;
  providerPaymentId: string;
  paymentMethod: OrderConfirmationEmailData["paymentMethod"];
  paidAt: string;
};

export type PaymentSucceededResult = {
  orderId: string;
  orderStatus: "paid" | "cod_pending";
  emailSent: boolean;
  emailMode?: "resend" | "log";
  emailMessageId?: string;
  emailError?: string;
};

/**
 * Phase 4 entry point — call from payment gateway webhook after capture succeeds.
 * Updates order status (mock until Supabase) and sends confirmation email.
 */
export async function onPaymentSucceeded(
  emailData: OrderConfirmationEmailData,
  event: PaymentSucceededEvent,
): Promise<PaymentSucceededResult> {
  const orderStatus =
    event.paymentMethod === "cod" ? "cod_pending" : "paid";

  if (publicEnv.useMockData) {
    console.info("[mbody] onPaymentSucceeded (mock)", {
      orderId: event.orderId,
      providerPaymentId: event.providerPaymentId,
      orderStatus,
      paymentMethod: event.paymentMethod,
      paidAt: event.paidAt,
    });
  }

  // Supabase (Phase 4): update orders.status + order_payments.status, increment units_sold
  // const supabase = createServiceRoleClient();
  // await supabase.from('orders').update({ status: orderStatus }).eq('id', event.orderId);
  // await supabase.from('order_payments').update({ status: 'succeeded', provider_payment_id: event.providerPaymentId })...

  const emailResult = await sendOrderConfirmationEmail(emailData);

  return {
    orderId: event.orderId,
    orderStatus,
    emailSent: emailResult.ok,
    emailMode: emailResult.mode,
    emailMessageId: emailResult.messageId,
    emailError: emailResult.error,
  };
}
