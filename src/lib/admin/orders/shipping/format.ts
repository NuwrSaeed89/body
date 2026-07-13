import { carrierLabel, serviceLabel } from "@/lib/admin/shipping/format";
import type { ShippingCarrier, ShippingService } from "@/lib/admin/shipping/types";
import { formatOrderDate } from "@/lib/admin/format";
import type { OrderLabelStatus, OrderShippingShipment } from "./types";
import { EMPTY_ORDER_SHIPPING } from "./types";

export type DbOrderShippingFields = {
  shipping_carrier: string | null;
  shipping_service: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  label_url: string | null;
  label_status: string | null;
  shipped_at: string | null;
  shipping_notes: string | null;
};

function labelStatusLabel(status: OrderLabelStatus): string {
  if (status === "manual") return "Manual tracking";
  if (status === "generated") return "Label generated";
  return "Not set";
}

export function mapOrderShippingShipment(
  row: Partial<DbOrderShippingFields> | null | undefined,
  locale: string,
): OrderShippingShipment {
  if (!row) return EMPTY_ORDER_SHIPPING;

  const carrier =
    row.shipping_carrier === "postnord" || row.shipping_carrier === "dhl"
      ? (row.shipping_carrier as ShippingCarrier)
      : null;
  const service =
    row.shipping_service === "standard" || row.shipping_service === "express"
      ? (row.shipping_service as ShippingService)
      : null;
  const labelStatus: OrderLabelStatus =
    row.label_status === "manual" || row.label_status === "generated"
      ? row.label_status
      : "none";

  return {
    carrier,
    carrierLabel: carrier ? carrierLabel(carrier) : null,
    service,
    serviceLabel: service ? serviceLabel(service) : null,
    trackingNumber: row.tracking_number?.trim() || null,
    trackingUrl: row.tracking_url?.trim() || null,
    labelUrl: row.label_url?.trim() || null,
    labelStatus,
    labelStatusLabel: labelStatusLabel(labelStatus),
    shippedAt: row.shipped_at ? formatOrderDate(row.shipped_at, locale) : null,
    notes: row.shipping_notes?.trim() || null,
  };
}

/** Public track-and-trace URLs used when the admin does not supply a custom URL. */
export function defaultTrackingUrl(
  carrier: ShippingCarrier,
  trackingNumber: string,
): string {
  const id = encodeURIComponent(trackingNumber.trim());
  if (carrier === "dhl") {
    return `https://www.dhl.com/se-en/home/tracking.html?tracking-id=${id}`;
  }
  return `https://www.postnord.se/en/our-tools/track-and-trace?shipmentId=${id}`;
}
