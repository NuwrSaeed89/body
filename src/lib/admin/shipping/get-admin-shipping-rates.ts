import { shouldUseAdminMock } from "@/lib/admin/should-use-mock";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { mapShippingRateRow, type DbShippingRate } from "./format";
import type { AdminShippingRateRow, AdminShippingRatesData } from "./types";

const MOCK_ADMIN_SHIPPING_RATES: AdminShippingRateRow[] = [
  {
    id: "sr1",
    carrier: "postnord",
    carrierLabel: "PostNord",
    service: "standard",
    serviceLabel: "Standard",
    zoneCode: "SE",
    zoneLabel: "Sweden",
    countries: ["SE"],
    countriesLabel: "SE",
    priceSek: 49,
    priceLabel: "49 SEK",
    etaMinDays: 1,
    etaMaxDays: 3,
    etaLabel: "1–3d",
    isActive: true,
    statusLabel: "Active",
    sortOrder: 10,
  },
  {
    id: "sr2",
    carrier: "dhl",
    carrierLabel: "DHL",
    service: "express",
    serviceLabel: "Express",
    zoneCode: "DACH",
    zoneLabel: "Germany / Austria / Switzerland",
    countries: ["DE", "AT", "CH"],
    countriesLabel: "DE, AT, CH",
    priceSek: 139,
    priceLabel: "139 SEK",
    etaMinDays: 1,
    etaMaxDays: 3,
    etaLabel: "1–3d",
    isActive: true,
    statusLabel: "Active",
    sortOrder: 33,
  },
  {
    id: "sr3",
    carrier: "postnord",
    carrierLabel: "PostNord",
    service: "standard",
    serviceLabel: "Standard",
    zoneCode: "NORDICS",
    zoneLabel: "Nordics",
    countries: ["NO", "DK", "FI", "IS"],
    countriesLabel: "NO, DK, FI, IS",
    priceSek: 79,
    priceLabel: "79 SEK",
    etaMinDays: 2,
    etaMaxDays: 5,
    etaLabel: "2–5d",
    isActive: true,
    statusLabel: "Active",
    sortOrder: 20,
  },
];

async function fetchShippingRates(locale: string): Promise<AdminShippingRatesData> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("shipping_rates")
    .select(
      "id, carrier, service, zone_code, zone_label, countries, price_sek, eta_min_days, eta_max_days, is_active, sort_order",
    )
    .order("sort_order", { ascending: true })
    .order("carrier", { ascending: true })
    .order("service", { ascending: true });

  if (error) throw error;

  const rates = ((data ?? []) as DbShippingRate[]).map((row) => mapShippingRateRow(row, locale));
  return {
    source: "supabase",
    rates,
    totalCount: rates.length,
  };
}

export async function getAdminShippingRatesData(locale: string): Promise<AdminShippingRatesData> {
  if (shouldUseAdminMock()) {
    return {
      source: "mock",
      rates: MOCK_ADMIN_SHIPPING_RATES,
      totalCount: MOCK_ADMIN_SHIPPING_RATES.length,
    };
  }

  try {
    return await fetchShippingRates(locale);
  } catch (error) {
    console.error("[admin] shipping rates fetch failed:", error);
    return {
      source: "mock",
      rates: MOCK_ADMIN_SHIPPING_RATES,
      totalCount: MOCK_ADMIN_SHIPPING_RATES.length,
    };
  }
}
