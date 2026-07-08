import { formatOrderStatusLabel } from "../format";
import type { AdminOrderRow } from "../list-types";

export const ADMIN_ORDER_STATUS_FILTERS = [
  "pending_payment",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
] as const;

export type AdminOrderStatusFilter =
  | (typeof ADMIN_ORDER_STATUS_FILTERS)[number]
  | "all";

export type AdminOrderPaymentFilter = "all" | "cod" | "online";

export type AdminOrderFilters = {
  status: AdminOrderStatusFilter;
  payment: AdminOrderPaymentFilter;
  dateFrom: string | null;
  dateTo: string | null;
};

export const DEFAULT_ADMIN_ORDER_FILTERS: AdminOrderFilters = {
  status: "all",
  payment: "all",
  dateFrom: null,
  dateTo: null,
};

const PAYMENT_FILTER_VALUES = new Set<AdminOrderPaymentFilter>(["all", "cod", "online"]);

function readParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = searchParams[key];
  return typeof value === "string" ? value : undefined;
}

function isValidDateInput(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00`));
}

export function parseAdminOrderFilters(
  searchParams: Record<string, string | string[] | undefined>,
): AdminOrderFilters {
  const statusRaw = readParam(searchParams, "status");
  const paymentRaw = readParam(searchParams, "payment");
  const dateFromRaw = readParam(searchParams, "dateFrom");
  const dateToRaw = readParam(searchParams, "dateTo");

  const status =
    statusRaw &&
    (ADMIN_ORDER_STATUS_FILTERS as readonly string[]).includes(statusRaw)
      ? (statusRaw as AdminOrderStatusFilter)
      : "all";

  const payment =
    paymentRaw && PAYMENT_FILTER_VALUES.has(paymentRaw as AdminOrderPaymentFilter)
      ? (paymentRaw as AdminOrderPaymentFilter)
      : "all";

  return {
    status,
    payment,
    dateFrom: dateFromRaw && isValidDateInput(dateFromRaw) ? dateFromRaw : null,
    dateTo: dateToRaw && isValidDateInput(dateToRaw) ? dateToRaw : null,
  };
}

export function hasActiveOrderFilters(filters: AdminOrderFilters): boolean {
  return (
    filters.status !== "all" ||
    filters.payment !== "all" ||
    Boolean(filters.dateFrom) ||
    Boolean(filters.dateTo)
  );
}

export function filtersToSearchParams(filters: AdminOrderFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.status !== "all") params.set("status", filters.status);
  if (filters.payment !== "all") params.set("payment", filters.payment);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  return params;
}

export function orderStatusFilterLabel(status: AdminOrderStatusFilter): string {
  if (status === "all") return "All statuses";
  return formatOrderStatusLabel(status);
}

export function orderPaymentFilterLabel(payment: AdminOrderPaymentFilter): string {
  if (payment === "all") return "All payments";
  if (payment === "cod") return "COD";
  return "Online";
}

export function startOfDayIso(date: string): string {
  return new Date(`${date}T00:00:00`).toISOString();
}

export function endOfDayIso(date: string): string {
  return new Date(`${date}T23:59:59.999`).toISOString();
}

export function filterMockOrders(
  orders: AdminOrderRow[],
  filters: AdminOrderFilters,
): AdminOrderRow[] {
  return orders.filter((order) => {
    if (filters.status !== "all" && order.statusRaw !== filters.status) {
      return false;
    }

    if (filters.payment === "cod" && !order.isCod) return false;
    if (filters.payment === "online" && order.isCod) return false;

    if (filters.dateFrom) {
      const from = new Date(startOfDayIso(filters.dateFrom)).getTime();
      if (new Date(order.createdAt).getTime() < from) return false;
    }

    if (filters.dateTo) {
      const to = new Date(endOfDayIso(filters.dateTo)).getTime();
      if (new Date(order.createdAt).getTime() > to) return false;
    }

    return true;
  });
}
