import {
  formatAdminDisplayAmount,
  formatOrderDate,
  formatOrderStatusLabel,
} from "./format";
import type { AdminOrderDetail } from "./list-types";
import { getMockAdminOrderDetail } from "./mock-order-detail";
import {
  mapOrderShippingShipment,
  type DbOrderShippingFields,
} from "./orders/shipping/format";
import { EMPTY_ORDER_SHIPPING } from "./orders/shipping/types";
import { shouldUseAdminMock } from "./should-use-mock";
import { formatPaymentMethodLabel } from "@/lib/payment/payment-methods";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type DbOrder = {
  id: string;
  order_number: string;
  user_id: string;
  status: string;
  currency: string;
  subtotal: number;
  discount_total: number;
  shipping_total: number;
  tax_total: number;
  grand_total: number;
  is_cod: boolean;
  created_at: string;
  shipping_address: unknown;
} & Partial<DbOrderShippingFields>;

const ORDER_DETAIL_SELECT_WITH_SHIPPING =
  "id, order_number, user_id, status, currency, subtotal, discount_total, shipping_total, tax_total, grand_total, is_cod, created_at, shipping_address, shipping_carrier, shipping_service, tracking_number, tracking_url, label_url, label_status, shipped_at, shipping_notes";

const ORDER_DETAIL_SELECT_BASE =
  "id, order_number, user_id, status, currency, subtotal, discount_total, shipping_total, tax_total, grand_total, is_cod, created_at, shipping_address";

type DbOrderItem = {
  id: string;
  variant_id: string;
  product_name: string;
  sku: string;
  size_code: string;
  color_code: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

type DbProfile = {
  id: string;
  full_name: string | null;
  email: string;
};

type DbPayment = {
  method: string;
  status: string;
};

type DbOrderReturn = {
  id: string;
  order_item_id: string;
  variant_id: string;
  quantity: number;
  reason: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  approved_at: string | null;
  restocked_at: string | null;
};

function resolveCustomer(
  profile: DbProfile | undefined,
  shippingAddress: unknown,
): { name: string; email: string } {
  const email = profile?.email ?? "—";
  if (profile?.full_name?.trim()) {
    return { name: profile.full_name.trim(), email };
  }
  if (
    shippingAddress &&
    typeof shippingAddress === "object" &&
    "fullName" in shippingAddress &&
    typeof (shippingAddress as { fullName?: string }).fullName === "string"
  ) {
    return { name: (shippingAddress as { fullName: string }).fullName, email };
  }
  if (
    shippingAddress &&
    typeof shippingAddress === "object" &&
    "name" in shippingAddress &&
    typeof (shippingAddress as { name?: string }).name === "string"
  ) {
    return { name: (shippingAddress as { name: string }).name, email };
  }
  return { name: email, email };
}

export function formatShippingAddressLines(shippingAddress: unknown): string[] {
  if (!shippingAddress || typeof shippingAddress !== "object") return ["—"];

  const addr = shippingAddress as Record<string, unknown>;
  const lines: string[] = [];

  const name =
    typeof addr.name === "string"
      ? addr.name
      : typeof addr.fullName === "string"
        ? addr.fullName
        : null;
  if (name) lines.push(name);

  if (typeof addr.line1 === "string") {
    lines.push(addr.line1);
    if (typeof addr.line2 === "string" && addr.line2.trim()) {
      lines.push(addr.line2);
    }
    const cityLine = [addr.postalCode, addr.city]
      .filter((value) => typeof value === "string" && value.trim())
      .join(" ");
    if (cityLine) lines.push(cityLine);
    if (typeof addr.country === "string" && addr.country.trim()) {
      lines.push(addr.country);
    }
    return lines.length > 0 ? lines : ["—"];
  }

  return lines.length > 0 ? lines : ["—"];
}

function formatPaymentStatusLabel(status: string): string {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function fetchOrderDetail(
  orderId: string,
  locale: string,
): Promise<AdminOrderDetail | null> {
  const supabase = createSupabaseAdminClient();
  const contentLocale = ["en", "sv", "es", "de"].includes(locale) ? locale : "en";

  let order: DbOrder | null = null;
  let shippingColumnsAvailable = true;

  {
    const { data, error } = await supabase
      .from("orders")
      .select(ORDER_DETAIL_SELECT_WITH_SHIPPING)
      .eq("id", orderId)
      .maybeSingle();

    if (error) {
      const message = error.message?.toLowerCase() ?? "";
      const missingShippingCols =
        message.includes("shipping_carrier") ||
        message.includes("tracking_number") ||
        message.includes("label_status") ||
        message.includes("does not exist");
      if (!missingShippingCols) throw error;

      shippingColumnsAvailable = false;
      const fallback = await supabase
        .from("orders")
        .select(ORDER_DETAIL_SELECT_BASE)
        .eq("id", orderId)
        .maybeSingle();
      if (fallback.error) throw fallback.error;
      order = (fallback.data as DbOrder | null) ?? null;
    } else {
      order = (data as DbOrder | null) ?? null;
    }
  }

  if (!order) return null;

  const row = order;

  const [{ data: profile }, { data: items }, { data: payments }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", row.user_id)
      .maybeSingle(),
    supabase
      .from("order_items")
      .select(
        "id, variant_id, product_name, sku, size_code, color_code, quantity, unit_price, line_total",
      )
      .eq("order_id", orderId)
      .order("product_name", { ascending: true }),
    supabase
      .from("order_payments")
      .select("method, status")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  let returns: DbOrderReturn[] = [];
  try {
    const { data: returnRows, error: returnsError } = await supabase
      .from("order_returns")
      .select(
        "id, order_item_id, variant_id, quantity, reason, status, created_at, approved_at, restocked_at",
      )
      .eq("order_id", orderId)
      .order("created_at", { ascending: false });
    if (returnsError) throw returnsError;
    returns = (returnRows ?? []) as DbOrderReturn[];
  } catch (returnsError) {
    console.warn("[admin] order returns fetch skipped:", returnsError);
    returns = [];
  }

  const customer = resolveCustomer(
    (profile as DbProfile | null) ?? undefined,
    row.shipping_address,
  );
  const payment = (payments?.[0] ?? null) as DbPayment | null;

  return {
    id: row.id,
    orderNumber: row.order_number,
    customer: customer.name,
    email: customer.email,
    date: formatOrderDate(row.created_at, contentLocale),
    status: formatOrderStatusLabel(row.status),
    statusRaw: row.status,
    currency: row.currency,
    isCod: row.is_cod,
    subtotal: formatAdminDisplayAmount(Number(row.subtotal), row.currency, contentLocale),
    discountTotal: formatAdminDisplayAmount(
      Number(row.discount_total),
      row.currency,
      contentLocale,
    ),
    shippingTotal: formatAdminDisplayAmount(
      Number(row.shipping_total),
      row.currency,
      contentLocale,
    ),
    taxTotal: formatAdminDisplayAmount(Number(row.tax_total), row.currency, contentLocale),
    grandTotal: formatAdminDisplayAmount(Number(row.grand_total), row.currency, contentLocale),
    paymentMethod: payment
      ? formatPaymentMethodLabel(payment.method, row.is_cod)
      : row.is_cod
        ? formatPaymentMethodLabel("cod", true)
        : null,
    paymentStatus: payment ? formatPaymentStatusLabel(payment.status) : null,
    shippingAddressLines: formatShippingAddressLines(row.shipping_address),
    shipping: shippingColumnsAvailable
      ? mapOrderShippingShipment(row, contentLocale)
      : EMPTY_ORDER_SHIPPING,
    items: ((items ?? []) as DbOrderItem[]).map((item) => ({
      id: item.id,
      variantId: item.variant_id,
      productName: item.product_name,
      sku: item.sku,
      sizeCode: item.size_code,
      colorCode: item.color_code,
      quantity: item.quantity,
      unitPrice: formatAdminDisplayAmount(
        Number(item.unit_price),
        row.currency,
        contentLocale,
      ),
      lineTotal: formatAdminDisplayAmount(Number(item.line_total), row.currency, contentLocale),
    })),
    returns: returns.map((item) => ({
      id: item.id,
      orderItemId: item.order_item_id,
      variantId: item.variant_id,
      quantity: item.quantity,
      reason: item.reason,
      status: item.status,
      statusLabel: formatOrderStatusLabel(item.status),
      createdAt: formatOrderDate(item.created_at, contentLocale),
      approvedAt: item.approved_at ? formatOrderDate(item.approved_at, contentLocale) : null,
      restockedAt: item.restocked_at ? formatOrderDate(item.restocked_at, contentLocale) : null,
    })),
    source: "supabase",
  };
}

export async function getAdminOrderDetail(
  orderId: string,
  locale: string,
): Promise<AdminOrderDetail | null> {
  if (shouldUseAdminMock()) {
    return getMockAdminOrderDetail(orderId);
  }

  try {
    return await fetchOrderDetail(orderId, locale);
  } catch (error) {
    console.error("[admin] order detail fetch failed:", error);
    return getMockAdminOrderDetail(orderId);
  }
}
