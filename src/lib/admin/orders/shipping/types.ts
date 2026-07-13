import type { ShippingCarrier, ShippingService } from "@/lib/admin/shipping/types";

export type OrderLabelStatus = "none" | "manual" | "generated";

export type OrderShippingShipment = {
  carrier: ShippingCarrier | null;
  carrierLabel: string | null;
  service: ShippingService | null;
  serviceLabel: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  labelUrl: string | null;
  labelStatus: OrderLabelStatus;
  labelStatusLabel: string;
  shippedAt: string | null;
  notes: string | null;
};

export type OrderShippingWriteInput = {
  carrier: ShippingCarrier;
  service: ShippingService;
  trackingNumber: string;
  trackingUrl: string | null;
  labelUrl: string | null;
  labelStatus: OrderLabelStatus;
  notes: string | null;
  markShipped: boolean;
};

export const EMPTY_ORDER_SHIPPING: OrderShippingShipment = {
  carrier: null,
  carrierLabel: null,
  service: null,
  serviceLabel: null,
  trackingNumber: null,
  trackingUrl: null,
  labelUrl: null,
  labelStatus: "none",
  labelStatusLabel: "Not set",
  shippedAt: null,
  notes: null,
};
