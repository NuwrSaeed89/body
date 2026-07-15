import type { ShippingCarrier, ShippingRateWriteInput, ShippingService } from "./types";

const CARRIERS: ShippingCarrier[] = ["postnord", "dhl"];
const SERVICES: ShippingService[] = ["standard", "express"];

function readString(value: unknown, field: string): { ok: true; value: string } | { ok: false; error: string } {
  if (typeof value !== "string" || !value.trim()) {
    return { ok: false, error: `${field} is required` };
  }
  return { ok: true, value: value.trim() };
}

function readCountries(value: unknown): { ok: true; value: string[] } | { ok: false; error: string } {
  let list: string[] = [];
  if (typeof value === "string") {
    list = value
      .split(/[\s,]+/)
      .map((code) => code.trim().toUpperCase())
      .filter(Boolean);
  } else if (Array.isArray(value)) {
    list = value
      .filter((code): code is string => typeof code === "string")
      .map((code) => code.trim().toUpperCase())
      .filter(Boolean);
  }

  if (list.length === 0) {
    return { ok: false, error: "At least one country code is required (e.g. SE, DE)" };
  }

  for (const code of list) {
    if (!/^[A-Z]{2}$/.test(code)) {
      return { ok: false, error: `Invalid country code: ${code}` };
    }
  }

  return { ok: true, value: [...new Set(list)] };
}

export function parseShippingRateWriteBody(
  body: unknown,
): { ok: true; data: ShippingRateWriteInput } | { ok: false; error: string } {
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

  const zoneCode = readString(raw.zoneCode, "Zone code");
  if (!zoneCode.ok) return zoneCode;

  const zoneLabel = readString(raw.zoneLabel, "Zone label");
  if (!zoneLabel.ok) return zoneLabel;

  const countries = readCountries(raw.countries);
  if (!countries.ok) return countries;

  const priceUsd = Number(
    raw.priceUsd !== undefined ? raw.priceUsd : raw.priceSek,
  );
  if (!Number.isFinite(priceUsd) || priceUsd < 0) {
    return { ok: false, error: "Price must be a number ≥ 0 (USD)" };
  }

  const etaMinDays = Number(raw.etaMinDays);
  const etaMaxDays = Number(raw.etaMaxDays);
  if (!Number.isInteger(etaMinDays) || etaMinDays < 0) {
    return { ok: false, error: "ETA min days must be an integer ≥ 0" };
  }
  if (!Number.isInteger(etaMaxDays) || etaMaxDays < etaMinDays) {
    return { ok: false, error: "ETA max days must be ≥ min days" };
  }

  const sortOrder = Number(raw.sortOrder ?? 0);
  if (!Number.isInteger(sortOrder)) {
    return { ok: false, error: "Sort order must be an integer" };
  }

  return {
    ok: true,
    data: {
      carrier: carrierRaw as ShippingCarrier,
      service: serviceRaw as ShippingService,
      zoneCode: zoneCode.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_"),
      zoneLabel: zoneLabel.value,
      countries: countries.value,
      priceUsd,
      etaMinDays,
      etaMaxDays,
      isActive: raw.isActive !== false,
      sortOrder,
    },
  };
}
