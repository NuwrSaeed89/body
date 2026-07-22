import "server-only";

import { sendOrderConfirmationEmail } from "@/lib/emails/send-order-confirmation";
import type {
  OrderConfirmationEmailData,
  OrderConfirmationLocale,
} from "@/lib/emails/order-confirmation-types";
import type { OrderPaymentMethod } from "@/lib/payment/payment-methods";
import { normalizeOrderPaymentMethod } from "@/lib/payment/payment-methods";
import {
  calculateCartSummary,
  extractVatFromInclusive,
  formatPriceFromSek,
} from "@/lib/currency";
import { hasSupabaseConfig, publicEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  PaymentWebhookEvent,
  PaymentWebhookPayload,
  PaymentWebhookResult,
} from "@/lib/orders/payment-webhook-types";

type DbOrderRow = {
  id: string;
  order_number: string;
  status: string;
  currency: string;
  subtotal: number;
  shipping_total: number;
  tax_total: number;
  grand_total: number;
  is_cod: boolean;
  created_at: string;
  shipping_address: {
    fullName?: string;
    name?: string;
    line1?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  } | null;
  user_id: string;
};

type DbOrderItem = {
  product_name: string;
  size_code: string;
  color_code: string;
  quantity: number;
  line_total: number;
};

type DbPaymentRow = {
  id: string;
  order_id: string;
  method: string;
  status: string;
  provider_payment_id: string | null;
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function toEmailLocale(locale: string | undefined): OrderConfirmationLocale {
  if (locale === "sv" || locale === "es" || locale === "de") return locale;
  return "en";
}

function mapPaymentMethod(
  method: string | undefined,
  isCod: boolean,
): OrderPaymentMethod {
  return normalizeOrderPaymentMethod(method, isCod);
}

async function findOrder(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  payload: PaymentWebhookPayload,
): Promise<{ order: DbOrderRow; payment: DbPaymentRow | null } | null> {
  let order: DbOrderRow | null = null;

  if (payload.orderId && isUuid(payload.orderId)) {
    const { data } = await supabase
      .from("orders")
      .select(
        "id, order_number, status, currency, subtotal, shipping_total, tax_total, grand_total, is_cod, created_at, shipping_address, user_id",
      )
      .eq("id", payload.orderId)
      .maybeSingle();
    order = (data as DbOrderRow | null) ?? null;
  }

  if (!order && payload.orderNumber) {
    const { data } = await supabase
      .from("orders")
      .select(
        "id, order_number, status, currency, subtotal, shipping_total, tax_total, grand_total, is_cod, created_at, shipping_address, user_id",
      )
      .eq("order_number", payload.orderNumber)
      .maybeSingle();
    order = (data as DbOrderRow | null) ?? null;
  }

  if (!order && payload.providerPaymentId) {
    const { data: paymentByProvider } = await supabase
      .from("order_payments")
      .select("id, order_id, method, status, provider_payment_id")
      .eq("provider_payment_id", payload.providerPaymentId)
      .maybeSingle();

    if (paymentByProvider?.order_id) {
      const { data } = await supabase
        .from("orders")
        .select(
          "id, order_number, status, currency, subtotal, shipping_total, tax_total, grand_total, is_cod, created_at, shipping_address, user_id",
        )
        .eq("id", paymentByProvider.order_id)
        .maybeSingle();
      order = (data as DbOrderRow | null) ?? null;
      if (order) {
        return {
          order,
          payment: paymentByProvider as DbPaymentRow,
        };
      }
    }
  }

  // Fallback: orderNumber embedded in email payload
  if (!order && payload.order?.orderNumber) {
    const { data } = await supabase
      .from("orders")
      .select(
        "id, order_number, status, currency, subtotal, shipping_total, tax_total, grand_total, is_cod, created_at, shipping_address, user_id",
      )
      .eq("order_number", payload.order.orderNumber)
      .maybeSingle();
    order = (data as DbOrderRow | null) ?? null;
  }

  if (!order) return null;

  const { data: payment } = await supabase
    .from("order_payments")
    .select("id, order_id, method, status, provider_payment_id")
    .eq("order_id", order.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    order,
    payment: (payment as DbPaymentRow | null) ?? null,
  };
}

async function buildEmailFromOrder(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  order: DbOrderRow,
  paymentMethod: OrderPaymentMethod,
  localeHint?: string,
): Promise<OrderConfirmationEmailData | null> {
  const { data: items } = await supabase
    .from("order_items")
    .select("product_name, size_code, color_code, quantity, line_total")
    .eq("order_id", order.id);

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", order.user_id)
    .maybeSingle();

  let customerEmail = (profile as { email?: string } | null)?.email?.trim() ?? "";
  if (!customerEmail) {
    try {
      const { data } = await supabase.auth.admin.getUserById(order.user_id);
      customerEmail = data.user?.email?.trim() ?? "";
    } catch {
      customerEmail = "";
    }
  }
  if (!customerEmail) return null;

  const locale = toEmailLocale(localeHint);
  const address = order.shipping_address ?? {};
  const customerName =
    (profile as { full_name?: string | null } | null)?.full_name?.trim() ||
    address.fullName ||
    address.name ||
    "Customer";

  const subtotal = Number(order.subtotal);
  const summary = calculateCartSummary(subtotal, "SEK", locale === "sv" ? "sv-SE" : "en-US");
  const vatSek = extractVatFromInclusive(subtotal + Number(order.shipping_total));

  return {
    locale,
    orderNumber: order.order_number,
    orderDate: new Intl.DateTimeFormat(locale, {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date(order.created_at)),
    customerEmail,
    customerName,
    paymentMethod,
    shippingMethod: "Standard Shipping",
    shippingAddress: {
      name: customerName,
      line1: address.line1 ?? "",
      city: address.city ?? "",
      postalCode: address.postalCode ?? "",
      country: address.country ?? "",
    },
    items: ((items as DbOrderItem[] | null) ?? []).map((item) => ({
      name: item.product_name,
      size: item.size_code,
      color: item.color_code !== "DEFAULT" ? item.color_code : undefined,
      quantity: item.quantity,
      lineTotalFormatted: formatPriceFromSek(Number(item.line_total), "SEK", locale),
    })),
    subtotalFormatted: summary.subtotal,
    shippingFormatted:
      Number(order.shipping_total) <= 0 ? "Free" : summary.shipping,
    vatFormatted: formatPriceFromSek(vatSek, "SEK", locale),
    totalFormatted: formatPriceFromSek(Number(order.grand_total), "SEK", locale),
    accountOrderUrl: `${publicEnv.appUrl}/${locale}/account/orders`,
  };
}

function mockResult(
  event: PaymentWebhookEvent,
  payload: PaymentWebhookPayload,
  orderStatus: string,
  paymentStatus: string,
): PaymentWebhookResult {
  const orderId = payload.orderId ?? payload.orderNumber ?? "mock-order";
  const orderNumber = payload.orderNumber ?? payload.order?.orderNumber ?? orderId;
  console.info("[mbody] payment webhook (mock)", {
    event,
    orderId,
    orderNumber,
    providerPaymentId: payload.providerPaymentId,
    orderStatus,
    paymentStatus,
  });
  return {
    ok: true,
    event,
    orderId,
    orderNumber,
    orderStatus,
    paymentStatus,
    alreadyProcessed: false,
  };
}

/**
 * Apply payment.succeeded | payment.failed | payment.refunded to orders + order_payments.
 * On succeeded → order becomes `paid` (units_sold trigger) and confirmation email is sent.
 */
export async function applyPaymentWebhook(
  payload: PaymentWebhookPayload,
): Promise<PaymentWebhookResult> {
  const occurredAt = payload.occurredAt ?? new Date().toISOString();

  if (publicEnv.useMockData || !hasSupabaseConfig()) {
    if (payload.event === "payment.succeeded") {
      const emailData = payload.order;
      let emailSent = false;
      let emailMode: "resend" | "log" | undefined;
      let emailMessageId: string | undefined;
      let emailError: string | undefined;
      if (emailData) {
        const emailResult = await sendOrderConfirmationEmail(emailData);
        emailSent = emailResult.ok;
        emailMode = emailResult.mode;
        emailMessageId = emailResult.messageId;
        emailError = emailResult.error;
      }
      return {
        ...mockResult(payload.event, payload, "paid", "captured"),
        emailSent,
        emailMode,
        emailMessageId,
        emailError,
      };
    }
    if (payload.event === "payment.failed") {
      return mockResult(payload.event, payload, "pending_payment", "failed");
    }
    return mockResult(payload.event, payload, "cancelled", "refunded");
  }

  const supabase = createSupabaseAdminClient();
  const found = await findOrder(supabase, payload);
  if (!found) {
    return {
      ok: false,
      event: payload.event,
      orderId: payload.orderId ?? "",
      orderNumber: payload.orderNumber ?? payload.order?.orderNumber ?? "",
      orderStatus: "",
      paymentStatus: "",
      error: "Order not found",
    };
  }

  const { order, payment } = found;
  const paymentMethod = mapPaymentMethod(
    payload.paymentMethod ?? payment?.method,
    order.is_cod,
  );

  if (payload.event === "payment.succeeded") {
    const alreadyPaid =
      order.status === "paid" &&
      (payment?.status === "captured" || payment?.provider_payment_id === payload.providerPaymentId);

    if (!alreadyPaid) {
      const { error: orderError } = await supabase
        .from("orders")
        .update({ status: "paid" })
        .eq("id", order.id);
      if (orderError) throw orderError;

      if (payment) {
        const { error: paymentError } = await supabase
          .from("order_payments")
          .update({
            status: "captured",
            provider_payment_id: payload.providerPaymentId,
            method: paymentMethod,
            metadata: {
              source: "payment_webhook",
              event: payload.event,
              occurredAt,
            },
          })
          .eq("id", payment.id);
        if (paymentError) throw paymentError;
      } else {
        const { error: paymentInsertError } = await supabase.from("order_payments").insert({
          order_id: order.id,
          method: paymentMethod,
          status: "captured",
          provider: "webhook",
          provider_payment_id: payload.providerPaymentId,
          amount: order.grand_total,
          currency: order.currency,
          metadata: { source: "payment_webhook", event: payload.event, occurredAt },
        });
        if (paymentInsertError) throw paymentInsertError;
      }
    }

    let emailData = payload.order ?? null;
    if (!emailData) {
      emailData = await buildEmailFromOrder(
        supabase,
        order,
        paymentMethod,
        payload.order?.locale,
      );
    }

    let emailSent = false;
    let emailMode: "resend" | "log" | undefined;
    let emailMessageId: string | undefined;
    let emailError: string | undefined;

    if (!alreadyPaid && emailData) {
      const emailResult = await sendOrderConfirmationEmail(emailData);
      emailSent = emailResult.ok;
      emailMode = emailResult.mode;
      emailMessageId = emailResult.messageId;
      emailError = emailResult.error;
    }

    return {
      ok: true,
      event: payload.event,
      orderId: order.id,
      orderNumber: order.order_number,
      orderStatus: "paid",
      paymentStatus: "captured",
      alreadyProcessed: alreadyPaid,
      emailSent,
      emailMode,
      emailMessageId,
      emailError,
    };
  }

  if (payload.event === "payment.failed") {
    if (payment) {
      const { error: paymentError } = await supabase
        .from("order_payments")
        .update({
          status: "failed",
          provider_payment_id: payload.providerPaymentId,
          metadata: {
            source: "payment_webhook",
            event: payload.event,
            occurredAt,
            reason: payload.reason ?? null,
          },
        })
        .eq("id", payment.id);
      if (paymentError) throw paymentError;
    }

    // Keep order awaiting payment unless already paid/shipped.
    let nextOrderStatus = order.status;
    if (order.status === "pending_payment") {
      nextOrderStatus = "pending_payment";
    }

    return {
      ok: true,
      event: payload.event,
      orderId: order.id,
      orderNumber: order.order_number,
      orderStatus: nextOrderStatus,
      paymentStatus: "failed",
    };
  }

  // payment.refunded
  const alreadyRefunded =
    payment?.status === "refunded" || order.status === "cancelled";

  if (!alreadyRefunded) {
    if (payment) {
      const { error: paymentError } = await supabase
        .from("order_payments")
        .update({
          status: "refunded",
          provider_payment_id: payload.providerPaymentId,
          metadata: {
            source: "payment_webhook",
            event: payload.event,
            occurredAt,
            reason: payload.reason ?? null,
          },
        })
        .eq("id", payment.id);
      if (paymentError) throw paymentError;
    }

    const { error: orderError } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", order.id);
    if (orderError) throw orderError;
  }

  return {
    ok: true,
    event: payload.event,
    orderId: order.id,
    orderNumber: order.order_number,
    orderStatus: "cancelled",
    paymentStatus: "refunded",
    alreadyProcessed: alreadyRefunded,
  };
}
