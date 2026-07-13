import type { ShippingCarrier, ShippingService } from "@/lib/admin/shipping/types";
import type { OrderLabelStatus, OrderShippingWriteInput } from "./types";

const CARRIERS: ShippingCarrier[] = ["postnord", "dhl"];
const SERVICES: ShippingService[] = ["standard", "express"];

function readOptionalString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function readUrl(value: unknown, field: string): { ok: true; value: string | null } | { ok: false; error: string } {
  const raw = readOptionalString(value);
  if (!raw) return { ok: true, value: null };
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { ok: false, error: `${field} must be an http(s) URL` };
    }
    return { ok: true, value: url.toString() };
  } catch {
    return { ok: false, error: `${field} must be a valid URL` };
  }
}

export function parseOrderShippingWriteBody(
  body: unknown,
  defaults?: { labelStatus?: OrderLabelStatus },
): { ok: true; data: OrderShippingWriteInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid JSON body" };
  }

  const raw = body as Record<string, unknown>;
  const carrierRaw = typeof raw.carrier === "string" ? raw.carrier.trim().toLowerCase() : "";
  const serviceRaw = typeof raw.service === "string" ? raw.service.trim().toLowerCase() : "";

  if (!CARRIERS.includes(carrierRaw as ShippingCarrier)) {
    return { ok: false, error: "Carrier must be postnord or dhl" };
  }
  if (!SERVICES.includes(serviceRaw as ShippingService)) {
    return { ok: false, error: "Service must be standard or express" };
  }

  const trackingNumber =
    typeof raw.trackingNumber === "string" ? raw.trackingNumber.trim() : "";
  if (!trackingNumber || trackingNumber.length < 4) {
    return { ok: false, error: "Tracking number is required (min 4 characters)" };
  }
  if (trackingNumber.length > 64) {
    return { ok: false, error: "Tracking number is too long" };
  }

  const trackingUrl = readUrl(raw.trackingUrl, "Tracking URL");
  if (!trackingUrl.ok) return trackingUrl;

  const labelUrl = readUrl(raw.labelUrl, "Label URL");
  if (!labelUrl.ok) return labelUrl;

  const labelStatusRaw =
    typeof raw.labelStatus === "string" ? raw.labelStatus.trim().toLowerCase() : "";
  const labelStatus: OrderLabelStatus =
    labelStatusRaw === "generated" || labelStatusRaw === "manual"
      ? labelStatusRaw
      : (defaults?.labelStatus ?? "manual");

  const notes = readOptionalString(raw.notes);
  if (notes && notes.length > 500) {
    return { ok: false, error: "Notes must be 500 characters or fewer" };
  }

  return {
    ok: true,
    data: {
      carrier: carrierRaw as ShippingCarrier,
      service: serviceRaw as ShippingService,
      trackingNumber,
      trackingUrl: trackingUrl.value,
      labelUrl: labelUrl.value,
      labelStatus,
      notes,
      markShipped: raw.markShipped !== false,
    },
  };
}

export function parseGenerateLabelBody(
  body: unknown,
):
  | { ok: true; data: { carrier: ShippingCarrier; service: ShippingService; markShipped: boolean } }
  | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid JSON body" };
  }

  const raw = body as Record<string, unknown>;
  const carrierRaw = typeof raw.carrier === "string" ? raw.carrier.trim().toLowerCase() : "postnord";
  const serviceRaw = typeof raw.service === "string" ? raw.service.trim().toLowerCase() : "standard";

  if (!CARRIERS.includes(carrierRaw as ShippingCarrier)) {
    return { ok: false, error: "Carrier must be postnord or dhl" };
  }
  if (!SERVICES.includes(serviceRaw as ShippingService)) {
    return { ok: false, error: "Service must be standard or express" };
  }

  return {
    ok: true,
    data: {
      carrier: carrierRaw as ShippingCarrier,
      service: serviceRaw as ShippingService,
      markShipped: raw.markShipped !== false,
    },
  };
}
