import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { mapShippingRateRow, type DbShippingRate } from "./format";
import type { ShippingRateDetail, ShippingRateWriteInput } from "./types";

const SHIPPING_RATE_SELECT =
  "id, carrier, service, zone_code, zone_label, countries, price_usd, eta_min_days, eta_max_days, is_active, sort_order";

function toDetail(row: DbShippingRate): ShippingRateDetail {
  return {
    id: row.id,
    carrier: row.carrier as ShippingRateDetail["carrier"],
    service: row.service as ShippingRateDetail["service"],
    zoneCode: row.zone_code,
    zoneLabel: row.zone_label,
    countries: row.countries ?? [],
    priceUsd: Number(row.price_usd ?? 0),
    etaMinDays: Number(row.eta_min_days ?? 0),
    etaMaxDays: Number(row.eta_max_days ?? 0),
    isActive: Boolean(row.is_active),
    sortOrder: Number(row.sort_order ?? 0),
  };
}

function toDbPayload(input: ShippingRateWriteInput) {
  return {
    carrier: input.carrier,
    service: input.service,
    zone_code: input.zoneCode,
    zone_label: input.zoneLabel,
    countries: input.countries,
    price_usd: input.priceUsd,
    eta_min_days: input.etaMinDays,
    eta_max_days: input.etaMaxDays,
    is_active: input.isActive,
    sort_order: input.sortOrder,
    updated_at: new Date().toISOString(),
  };
}

export async function createShippingRate(
  input: ShippingRateWriteInput,
  locale = "en",
): Promise<ShippingRateDetail> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("shipping_rates")
    .insert(toDbPayload(input))
    .select(SHIPPING_RATE_SELECT)
    .single();

  if (error) throw error;
  void locale;
  return toDetail(data as DbShippingRate);
}

export async function updateShippingRate(
  id: string,
  input: ShippingRateWriteInput,
): Promise<ShippingRateDetail> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("shipping_rates")
    .update(toDbPayload(input))
    .eq("id", id)
    .select(SHIPPING_RATE_SELECT)
    .single();

  if (error) throw error;
  return toDetail(data as DbShippingRate);
}

export async function deleteShippingRate(id: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("shipping_rates").delete().eq("id", id);
  if (error) throw error;
}

export function mapSupabaseShippingCrudError(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code: string }).code);
    if (code === "23505") {
      return "A rate for this carrier, service, and zone already exists.";
    }
    if (code === "42P01") {
      return "shipping_rates table missing — run database/014_shipping_rates.sql";
    }
  }
  const message =
    error && typeof error === "object" && "message" in error
      ? String((error as { message: unknown }).message)
      : error instanceof Error
        ? error.message
        : "";
  if (message.toLowerCase().includes("price_usd") || message.toLowerCase().includes("price_sek")) {
    return "Shipping price column mismatch — run database/017_shipping_rates_usd.sql";
  }
  if (error instanceof Error && error.message) return error.message;
  return "Could not save shipping rate.";
}

export { mapShippingRateRow };
