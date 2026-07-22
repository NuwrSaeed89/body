import "server-only";

import { hasSupabaseConfig, publicEnv } from "@/lib/env";
import { applyPaymentWebhook } from "@/lib/orders/apply-payment-webhook";
import type { PaymentWebhookResult } from "@/lib/orders/payment-webhook-types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type UnitsSoldProductSnapshot = {
  productId: string;
  productSlug: string | null;
  quantityInOrder: number;
  unitsSoldBefore: number;
  unitsSoldAfter?: number;
  expectedDelta: number;
  actualDelta?: number;
  passed?: boolean;
};

export type UnitsSoldOrderPreview = {
  ok: true;
  orderId: string;
  orderNumber: string;
  orderStatus: string;
  products: UnitsSoldProductSnapshot[];
};

export type UnitsSoldWebhookTestResult = {
  ok: boolean;
  action: "pay" | "refund";
  orderId: string;
  orderNumber: string;
  orderStatusBefore: string;
  orderStatusAfter: string;
  webhook: PaymentWebhookResult;
  products: UnitsSoldProductSnapshot[];
  allPassed: boolean;
  error?: string;
};

type DbOrderRow = {
  id: string;
  order_number: string;
  status: string;
};

type DbOrderItemRow = {
  product_id: string;
  quantity: number;
  products: { slug: string } | { slug: string }[] | null;
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

const unwrap = <T,>(value: T | T[] | null | undefined): T | null =>
  !value ? null : Array.isArray(value) ? (value[0] ?? null) : value;

async function loadOrder(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  input: { orderId?: string; orderNumber?: string },
): Promise<DbOrderRow | null> {
  if (input.orderId && isUuid(input.orderId)) {
    const { data } = await supabase
      .from("orders")
      .select("id, order_number, status")
      .eq("id", input.orderId)
      .maybeSingle();
    return (data as DbOrderRow | null) ?? null;
  }

  if (input.orderNumber) {
    const { data } = await supabase
      .from("orders")
      .select("id, order_number, status")
      .eq("order_number", input.orderNumber)
      .maybeSingle();
    return (data as DbOrderRow | null) ?? null;
  }

  return null;
}

async function loadOrderProductQuantities(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  orderId: string,
): Promise<Map<string, { quantity: number; slug: string | null }>> {
  const { data: items, error } = await supabase
    .from("order_items")
    .select("product_id, quantity, products(slug)")
    .eq("order_id", orderId);

  if (error) throw error;

  const byProduct = new Map<string, { quantity: number; slug: string | null }>();
  for (const row of (items as DbOrderItemRow[] | null) ?? []) {
    const product = unwrap(row.products);
    const existing = byProduct.get(row.product_id);
    const quantity = Number(row.quantity);
    if (existing) {
      existing.quantity += quantity;
    } else {
      byProduct.set(row.product_id, {
        quantity,
        slug: product?.slug ?? null,
      });
    }
  }
  return byProduct;
}

async function readUnitsSold(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  productIds: string[],
): Promise<Map<string, number>> {
  if (productIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from("products")
    .select("id, units_sold")
    .in("id", productIds);

  if (error) throw error;

  const map = new Map<string, number>();
  for (const row of (data as { id: string; units_sold: number }[] | null) ?? []) {
    map.set(row.id, Number(row.units_sold ?? 0));
  }
  return map;
}

function buildSnapshots(
  byProduct: Map<string, { quantity: number; slug: string | null }>,
  unitsSold: Map<string, number>,
  expectedSign: 1 | -1,
): UnitsSoldProductSnapshot[] {
  return [...byProduct.entries()].map(([productId, meta]) => {
    const unitsSoldBefore = unitsSold.get(productId) ?? 0;
    const expectedDelta = meta.quantity * expectedSign;
    return {
      productId,
      productSlug: meta.slug,
      quantityInOrder: meta.quantity,
      unitsSoldBefore,
      expectedDelta,
    };
  });
}

function finalizeSnapshots(
  snapshots: UnitsSoldProductSnapshot[],
  unitsSoldAfter: Map<string, number>,
): { products: UnitsSoldProductSnapshot[]; allPassed: boolean } {
  let allPassed = true;
  const products = snapshots.map((snapshot) => {
    const after = unitsSoldAfter.get(snapshot.productId) ?? snapshot.unitsSoldBefore;
    const actualDelta = after - snapshot.unitsSoldBefore;
    const passed = actualDelta === snapshot.expectedDelta;
    if (!passed) allPassed = false;
    return {
      ...snapshot,
      unitsSoldAfter: after,
      actualDelta,
      passed,
    };
  });
  return { products, allPassed };
}

function assertSupabaseReady(): void {
  if (publicEnv.useMockData || !hasSupabaseConfig()) {
    throw new Error(
      "units_sold webhook test requires Supabase (set NEXT_PUBLIC_USE_MOCK_DATA=false and Supabase env vars).",
    );
  }
}

/** Read-only preview — current units_sold for products on an order. */
export async function previewUnitsSoldForOrder(input: {
  orderId?: string;
  orderNumber?: string;
}): Promise<UnitsSoldOrderPreview | { ok: false; error: string }> {
  assertSupabaseReady();

  const supabase = createSupabaseAdminClient();
  const order = await loadOrder(supabase, input);
  if (!order) {
    return { ok: false, error: "Order not found" };
  }

  const byProduct = await loadOrderProductQuantities(supabase, order.id);
  const unitsSold = await readUnitsSold(supabase, [...byProduct.keys()]);
  const products = buildSnapshots(byProduct, unitsSold, 1).map((snapshot) => ({
    ...snapshot,
    unitsSoldAfter: snapshot.unitsSoldBefore,
    actualDelta: 0,
    passed: undefined,
  }));

  return {
    ok: true,
    orderId: order.id,
    orderNumber: order.order_number,
    orderStatus: order.status,
    products,
  };
}

/** Fire payment.succeeded and verify products.units_sold increments. */
export async function runUnitsSoldPayTest(input: {
  orderId?: string;
  orderNumber?: string;
  providerPaymentId?: string;
}): Promise<UnitsSoldWebhookTestResult> {
  assertSupabaseReady();

  const supabase = createSupabaseAdminClient();
  const order = await loadOrder(supabase, input);
  if (!order) {
    return {
      ok: false,
      action: "pay",
      orderId: input.orderId ?? "",
      orderNumber: input.orderNumber ?? "",
      orderStatusBefore: "",
      orderStatusAfter: "",
      webhook: {
        ok: false,
        event: "payment.succeeded",
        orderId: input.orderId ?? "",
        orderNumber: input.orderNumber ?? "",
        orderStatus: "",
        paymentStatus: "",
        error: "Order not found",
      },
      products: [],
      allPassed: false,
      error: "Order not found",
    };
  }

  if (order.status !== "pending_payment") {
    return {
      ok: false,
      action: "pay",
      orderId: order.id,
      orderNumber: order.order_number,
      orderStatusBefore: order.status,
      orderStatusAfter: order.status,
      webhook: {
        ok: false,
        event: "payment.succeeded",
        orderId: order.id,
        orderNumber: order.order_number,
        orderStatus: order.status,
        paymentStatus: "",
        error: `Order must be pending_payment (current: ${order.status})`,
      },
      products: [],
      allPassed: false,
      error: `Order must be pending_payment (current: ${order.status})`,
    };
  }

  const byProduct = await loadOrderProductQuantities(supabase, order.id);
  const before = await readUnitsSold(supabase, [...byProduct.keys()]);
  const snapshots = buildSnapshots(byProduct, before, 1);

  const providerPaymentId =
    input.providerPaymentId?.trim() || `pi_test_units_sold_${order.id.slice(0, 8)}`;

  const webhook = await applyPaymentWebhook({
    event: "payment.succeeded",
    providerPaymentId,
    orderId: order.id,
    orderNumber: order.order_number,
    paymentMethod: "card",
    occurredAt: new Date().toISOString(),
  });

  const refreshedOrder = await loadOrder(supabase, { orderId: order.id });
  const after = await readUnitsSold(supabase, [...byProduct.keys()]);
  const { products, allPassed } = finalizeSnapshots(snapshots, after);

  const orderStatusAfter = refreshedOrder?.status ?? webhook.orderStatus;
  const triggerPassed =
    webhook.ok &&
    orderStatusAfter === "paid" &&
    (webhook.alreadyProcessed || allPassed);

  return {
    ok: webhook.ok && triggerPassed,
    action: "pay",
    orderId: order.id,
    orderNumber: order.order_number,
    orderStatusBefore: order.status,
    orderStatusAfter,
    webhook,
    products,
    allPassed: webhook.alreadyProcessed ? true : allPassed,
    error:
      webhook.ok && !triggerPassed
        ? "Webhook succeeded but units_sold did not match expected increments"
        : webhook.error,
  };
}

/** Fire payment.refunded on a paid order and verify units_sold decrements. */
export async function runUnitsSoldRefundTest(input: {
  orderId?: string;
  orderNumber?: string;
  providerPaymentId?: string;
  reason?: string;
}): Promise<UnitsSoldWebhookTestResult> {
  assertSupabaseReady();

  const supabase = createSupabaseAdminClient();
  const order = await loadOrder(supabase, input);
  if (!order) {
    return {
      ok: false,
      action: "refund",
      orderId: input.orderId ?? "",
      orderNumber: input.orderNumber ?? "",
      orderStatusBefore: "",
      orderStatusAfter: "",
      webhook: {
        ok: false,
        event: "payment.refunded",
        orderId: input.orderId ?? "",
        orderNumber: input.orderNumber ?? "",
        orderStatus: "",
        paymentStatus: "",
        error: "Order not found",
      },
      products: [],
      allPassed: false,
      error: "Order not found",
    };
  }

  if (order.status !== "paid") {
    return {
      ok: false,
      action: "refund",
      orderId: order.id,
      orderNumber: order.order_number,
      orderStatusBefore: order.status,
      orderStatusAfter: order.status,
      webhook: {
        ok: false,
        event: "payment.refunded",
        orderId: order.id,
        orderNumber: order.order_number,
        orderStatus: order.status,
        paymentStatus: "",
        error: `Order must be paid (current: ${order.status})`,
      },
      products: [],
      allPassed: false,
      error: `Order must be paid (current: ${order.status})`,
    };
  }

  const byProduct = await loadOrderProductQuantities(supabase, order.id);
  const before = await readUnitsSold(supabase, [...byProduct.keys()]);
  const snapshots = buildSnapshots(byProduct, before, -1);

  const providerPaymentId =
    input.providerPaymentId?.trim() || `pi_test_units_sold_${order.id.slice(0, 8)}`;

  const webhook = await applyPaymentWebhook({
    event: "payment.refunded",
    providerPaymentId,
    orderId: order.id,
    orderNumber: order.order_number,
    occurredAt: new Date().toISOString(),
    reason: input.reason ?? "units_sold_test_refund",
  });

  const refreshedOrder = await loadOrder(supabase, { orderId: order.id });
  const after = await readUnitsSold(supabase, [...byProduct.keys()]);
  const { products, allPassed } = finalizeSnapshots(snapshots, after);

  const orderStatusAfter = refreshedOrder?.status ?? webhook.orderStatus;
  const triggerPassed =
    webhook.ok &&
    orderStatusAfter === "cancelled" &&
    (webhook.alreadyProcessed || allPassed);

  return {
    ok: webhook.ok && triggerPassed,
    action: "refund",
    orderId: order.id,
    orderNumber: order.order_number,
    orderStatusBefore: order.status,
    orderStatusAfter,
    webhook,
    products,
    allPassed: webhook.alreadyProcessed ? true : allPassed,
    error:
      webhook.ok && !triggerPassed
        ? "Webhook succeeded but units_sold did not match expected decrements"
        : webhook.error,
  };
}
