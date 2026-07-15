export type ShippingCarrier = "postnord" | "dhl";
export type ShippingService = "standard" | "express";

export type AdminShippingRateRow = {
  id: string;
  carrier: ShippingCarrier;
  carrierLabel: string;
  service: ShippingService;
  serviceLabel: string;
  zoneCode: string;
  zoneLabel: string;
  countries: string[];
  countriesLabel: string;
  priceUsd: number;
  priceLabel: string;
  etaMinDays: number;
  etaMaxDays: number;
  etaLabel: string;
  isActive: boolean;
  statusLabel: string;
  sortOrder: number;
};

export type ShippingRateDetail = {
  id: string;
  carrier: ShippingCarrier;
  service: ShippingService;
  zoneCode: string;
  zoneLabel: string;
  countries: string[];
  priceUsd: number;
  etaMinDays: number;
  etaMaxDays: number;
  isActive: boolean;
  sortOrder: number;
};

export type ShippingRateWriteInput = {
  carrier: ShippingCarrier;
  service: ShippingService;
  zoneCode: string;
  zoneLabel: string;
  countries: string[];
  priceUsd: number;
  etaMinDays: number;
  etaMaxDays: number;
  isActive: boolean;
  sortOrder: number;
};

export type AdminShippingRatesData = {
  source: "supabase" | "mock";
  rates: AdminShippingRateRow[];
  totalCount: number;
  /** Present when live Supabase is configured but shipping_rates could not be loaded. */
  loadError?: string | null;
};
