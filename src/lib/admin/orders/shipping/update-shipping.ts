import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ADMIN_STATUS_UPDATABLE_FROM } from "../constants";
import { defaultTrackingUrl } from "./format";
import type { OrderShippingWriteInput } from "./types";
import { generateCarrierShippingLabel } from "./carrier-api";
import type { ShippingCarrier, ShippingService } from "@/lib/admin/shipping/types";

async function assertOrderFulfillable(orderId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, order_number, status")
    .eq("id", orderId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Order not found");
  if (!ADMIN_STATUS_UPDATABLE_FROM.has(data.status)) {
    throw new Error(
      `Cannot update shipping while order is "${data.status as string}"`,
    );
  }
  return data as { id: string; order_number: string; status: string };
}

export async function updateOrderShipping(
  orderId: string,
  input: OrderShippingWriteInput,
): Promise<void> {
  const existing = await assertOrderFulfillable(orderId);
  const supabase = createSupabaseAdminClient();

  const trackingUrl =
    input.trackingUrl ?? defaultTrackingUrl(input.carrier, input.trackingNumber);

  const patch: Record<string, unknown> = {
    shipping_carrier: input.carrier,
    shipping_service: input.service,
    tracking_number: input.trackingNumber,
    tracking_url: trackingUrl,
    label_url: input.labelUrl,
    label_status: input.labelStatus,
    shipping_notes: input.notes,
    updated_at: new Date().toISOString(),
  };

  if (input.markShipped) {
    patch.status = "shipped";
    if (existing.status !== "shipped" && existing.status !== "delivered") {
      patch.shipped_at = new Date().toISOString();
    }
  }

  const { error } = await supabase.from("orders").update(patch).eq("id", orderId);
  if (error) throw error;
}

export async function generateOrderShippingLabel(
  orderId: string,
  input: {
    carrier: ShippingCarrier;
    service: ShippingService;
    markShipped: boolean;
  },
): Promise<{ mode: "live" | "simulated" }> {
  const existing = await assertOrderFulfillable(orderId);
  const label = await generateCarrierShippingLabel({
    orderId,
    orderNumber: existing.order_number,
    carrier: input.carrier,
    service: input.service,
  });

  await updateOrderShipping(orderId, {
    carrier: label.carrier,
    service: label.service,
    trackingNumber: label.trackingNumber,
    trackingUrl: label.trackingUrl,
    labelUrl: label.labelUrl,
    labelStatus: "generated",
    notes: `Carrier ref: ${label.providerReference}`,
    markShipped: input.markShipped,
  });

  return { mode: label.mode };
}

export function mapSupabaseShippingOrderError(error: unknown): string {
  if (!error || typeof error !== "object") return "Failed to update order shipping";
  const message =
    "message" in error && typeof error.message === "string" ? error.message : "";
  if (message.includes("shipping_carrier") || message.includes("label_status")) {
    return "Shipping columns missing — run database/015_order_shipping.sql in Supabase.";
  }
  if (message.includes("not found")) return "Order not found";
  return message || "Failed to update order shipping";
}
