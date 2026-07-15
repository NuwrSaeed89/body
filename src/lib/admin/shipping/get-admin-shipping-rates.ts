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
    priceUsd: 5,
    priceLabel: "$5.00",
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
    priceUsd: 13,
    priceLabel: "$13.00",
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
    priceUsd: 8,
    priceLabel: "$8.00",
    etaMinDays: 2,
    etaMaxDays: 5,
    etaLabel: "2–5d",
    isActive: true,
    statusLabel: "Active",
    sortOrder: 20,
  },
];

function mapShippingLoadError(error: unknown): string {
  const message =
    error && typeof error === "object" && "message" in error
      ? String((error as { message: unknown }).message)
      : error instanceof Error
        ? error.message
        : "";
  const lower = message.toLowerCase();

  if (
    lower.includes("shipping_rates") ||
    lower.includes("does not exist") ||
    lower.includes("schema cache") ||
    lower.includes("could not find the table") ||
    lower.includes("price_sek") ||
    lower.includes("price_usd")
  ) {
    if (lower.includes("price_sek") || lower.includes("price_usd")) {
      return "Shipping prices must be USD. Run database/017_shipping_rates_usd.sql in Supabase, then refresh.";
    }
    return "Table shipping_rates is missing. Run database/014_shipping_rates.sql in the Supabase SQL Editor, then refresh this page.";
  }

  return message || "Could not load shipping rates from Supabase.";
}

async function fetchShippingRates(locale: string): Promise<AdminShippingRatesData> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("shipping_rates")
    .select(
      "id, carrier, service, zone_code, zone_label, countries, price_usd, eta_min_days, eta_max_days, is_active, sort_order",
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
    loadError: null,
  };
}

export async function getAdminShippingRatesData(locale: string): Promise<AdminShippingRatesData> {
  if (shouldUseAdminMock()) {
    return {
      source: "mock",
      rates: MOCK_ADMIN_SHIPPING_RATES,
      totalCount: MOCK_ADMIN_SHIPPING_RATES.length,
      loadError: null,
    };
  }

  try {
    return await fetchShippingRates(locale);
  } catch (error) {
    console.error("[admin] shipping rates fetch failed:", error);
    // Stay on live source — do not silently swap to mock (that disables edit while shell says LIVE).
    return {
      source: "supabase",
      rates: [],
      totalCount: 0,
      loadError: mapShippingLoadError(error),
    };
  }
}
