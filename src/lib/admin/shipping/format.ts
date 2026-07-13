import { formatAdminAmount } from "@/lib/admin/format";
import type {
  AdminShippingRateRow,
  ShippingCarrier,
  ShippingService,
} from "./types";

export type DbShippingRate = {
  id: string;
  carrier: string;
  service: string;
  zone_code: string;
  zone_label: string;
  countries: string[] | null;
  price_sek: number;
  eta_min_days: number;
  eta_max_days: number;
  is_active: boolean;
  sort_order: number;
};

export function carrierLabel(carrier: ShippingCarrier): string {
  return carrier === "postnord" ? "PostNord" : "DHL";
}

export function serviceLabel(service: ShippingService): string {
  return service === "standard" ? "Standard" : "Express";
}

export function mapShippingRateRow(row: DbShippingRate, locale: string): AdminShippingRateRow {
  const carrier = row.carrier as ShippingCarrier;
  const service = row.service as ShippingService;
  const countries = row.countries ?? [];
  const etaMin = Number(row.eta_min_days ?? 0);
  const etaMax = Number(row.eta_max_days ?? 0);

  return {
    id: row.id,
    carrier,
    carrierLabel: carrierLabel(carrier),
    service,
    serviceLabel: serviceLabel(service),
    zoneCode: row.zone_code,
    zoneLabel: row.zone_label,
    countries,
    countriesLabel: countries.join(", "),
    priceSek: Number(row.price_sek ?? 0),
    priceLabel: formatAdminAmount(Number(row.price_sek ?? 0), locale, "SEK"),
    etaMinDays: etaMin,
    etaMaxDays: etaMax,
    etaLabel: etaMin === etaMax ? `${etaMin}d` : `${etaMin}–${etaMax}d`,
    isActive: Boolean(row.is_active),
    statusLabel: row.is_active ? "Active" : "Inactive",
    sortOrder: Number(row.sort_order ?? 0),
  };
}
