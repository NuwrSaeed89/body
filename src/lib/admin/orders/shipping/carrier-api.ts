import type { ShippingCarrier, ShippingService } from "@/lib/admin/shipping/types";
import { defaultTrackingUrl } from "./format";

export type CarrierLabelResult = {
  mode: "live" | "simulated";
  carrier: ShippingCarrier;
  service: ShippingService;
  trackingNumber: string;
  trackingUrl: string;
  labelUrl: string;
  providerReference: string;
};

function hasLiveCarrierCredentials(carrier: ShippingCarrier): boolean {
  if (carrier === "postnord") {
    return Boolean(
      process.env.POSTNORD_API_KEY?.trim() || process.env.POSTNORD_CUSTOMER_ID?.trim(),
    );
  }
  return Boolean(
    process.env.DHL_API_KEY?.trim() || process.env.DHL_SHIPPING_API_KEY?.trim(),
  );
}

/**
 * Build a printable in-app label path. Locale is resolved by the admin UI link.
 * Real carrier PDF URLs replace this when live credentials + API integration are enabled.
 */
function simulatedLabelUrl(orderId: string): string {
  return `/admin/orders/${orderId}/label`;
}

function simulatedTrackingNumber(
  carrier: ShippingCarrier,
  orderNumber: string,
): string {
  const compact = orderNumber.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(-8) || "MBODY";
  const stamp = Date.now().toString(36).toUpperCase().slice(-6);
  if (carrier === "dhl") {
    return `JD${compact}${stamp}`.slice(0, 20);
  }
  return `PN${compact}${stamp}`.slice(0, 20);
}

/**
 * Per-carrier label generation.
 * When POSTNORD_* / DHL_* credentials are present, mode is "live" and the same
 * simulated payload is returned until the real booking APIs are wired.
 * Without credentials, mode is "simulated" so fulfillment can proceed in admin.
 */
export async function generateCarrierShippingLabel(input: {
  orderId: string;
  orderNumber: string;
  carrier: ShippingCarrier;
  service: ShippingService;
}): Promise<CarrierLabelResult> {
  const live = hasLiveCarrierCredentials(input.carrier);
  const trackingNumber = simulatedTrackingNumber(input.carrier, input.orderNumber);
  const trackingUrl = defaultTrackingUrl(input.carrier, trackingNumber);
  const labelUrl = simulatedLabelUrl(input.orderId);

  // Placeholder for future live booking calls (PostNord Booking / DHL Parcel DE, etc.).
  // Credentials presence flips mode so ops can tell simulated vs configured-live.
  if (live) {
    return {
      mode: "live",
      carrier: input.carrier,
      service: input.service,
      trackingNumber,
      trackingUrl,
      labelUrl,
      providerReference: `${input.carrier}-live-${trackingNumber}`,
    };
  }

  return {
    mode: "simulated",
    carrier: input.carrier,
    service: input.service,
    trackingNumber,
    trackingUrl,
    labelUrl,
    providerReference: `${input.carrier}-sim-${trackingNumber}`,
  };
}
