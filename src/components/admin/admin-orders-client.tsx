"use client";

import { useEffect, useRef, useState } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import type { AdminOrderRow, AdminOrdersData } from "@/lib/admin/list-types";
import {
  ADMIN_ORDER_STATUS_FILTERS,
  DEFAULT_ADMIN_ORDER_FILTERS,
  filtersToSearchParams,
  hasActiveOrderFilters,
  orderPaymentFilterLabel,
  orderStatusFilterLabel,
  type AdminOrderFilters,
  type AdminOrderPaymentFilter,
} from "@/lib/admin/orders/filters";
import { orderStatusTone } from "@/lib/admin/orders/order-status-tone";
import { adminFieldClassName } from "./admin-form-styles";
import {
  adminCardToolbarClass,
  adminTableBodyCellClass,
  adminTableHeadCellClass,
} from "./admin-layout-styles";
import { AdminPageHeader } from "./admin-page-header";

type AdminOrdersClientProps = {
  data: AdminOrdersData;
  filters: AdminOrderFilters;
};

export function AdminOrdersClient({ data, filters }: AdminOrdersClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const filtersRef = useRef<HTMLDivElement>(null);

  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showPaymentMenu, setShowPaymentMenu] = useState(false);
  const [dateFrom, setDateFrom] = useState(filters.dateFrom ?? "");
  const [dateTo, setDateTo] = useState(filters.dateTo ?? "");

  useEffect(() => {
    setDateFrom(filters.dateFrom ?? "");
    setDateTo(filters.dateTo ?? "");
  }, [filters.dateFrom, filters.dateTo]);

  useEffect(() => {
    const closeOnOutside = (event: MouseEvent) => {
      if (!filtersRef.current?.contains(event.target as Node)) {
        setShowStatusMenu(false);
        setShowPaymentMenu(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutside);
    return () => document.removeEventListener("mousedown", closeOnOutside);
  }, []);

  const applyFilters = (next: AdminOrderFilters) => {
    const params = filtersToSearchParams(next);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const updateFilters = (patch: Partial<AdminOrderFilters>) => {
    applyFilters({ ...filters, ...patch });
  };

  const applyDateFilters = () => {
    updateFilters({
      dateFrom: dateFrom || null,
      dateTo: dateTo || null,
    });
  };

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    applyFilters(DEFAULT_ADMIN_ORDER_FILTERS);
  };

  const activeFilters = hasActiveOrderFilters(filters);
  const emptyMessage = activeFilters
    ? "No orders match your filters."
    : "No orders in the database yet. Completed checkouts will appear here.";

  const statusLabel = orderStatusFilterLabel(filters.status);
  const paymentLabel = orderPaymentFilterLabel(filters.payment);

  return (
    <>
      <AdminPageHeader
        title="Orders"
        description="Filter by status, payment method, or date range. Open an order to update fulfillment status."
        source={data.source}
        count={data.totalCount}
        countLabel="orders"
      />

      <article className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low">
        <div className={adminCardToolbarClass}>
          <div ref={filtersRef} className="flex w-full flex-col gap-3 xl:flex-row xl:flex-wrap xl:items-end">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowStatusMenu((open) => !open);
                  setShowPaymentMenu(false);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition-colors hover:bg-surface-container sm:w-auto"
              >
                <span className="material-symbols-outlined text-[18px]">sell</span>
                <span className="truncate">{statusLabel}</span>
              </button>
              {showStatusMenu && (
                <div className="absolute left-0 z-20 mt-2 max-h-72 min-w-[200px] overflow-y-auto rounded-lg border border-outline-variant bg-surface-container-lowest py-1 shadow-lg sm:left-auto sm:right-0">
                  <button
                    type="button"
                    onClick={() => {
                      updateFilters({ status: "all" });
                      setShowStatusMenu(false);
                    }}
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-surface-container"
                  >
                    All statuses
                  </button>
                  {ADMIN_ORDER_STATUS_FILTERS.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => {
                        updateFilters({ status });
                        setShowStatusMenu(false);
                      }}
                      className="block w-full px-4 py-2 text-left text-sm hover:bg-surface-container"
                    >
                      {orderStatusFilterLabel(status)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowPaymentMenu((open) => !open);
                  setShowStatusMenu(false);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition-colors hover:bg-surface-container sm:w-auto"
              >
                <span className="material-symbols-outlined text-[18px]">payments</span>
                <span className="truncate">{paymentLabel}</span>
              </button>
              {showPaymentMenu && (
                <div className="absolute left-0 z-20 mt-2 min-w-[180px] rounded-lg border border-outline-variant bg-surface-container-lowest py-1 shadow-lg sm:left-auto sm:right-0">
                  {(
                    [
                      ["all", "All payments"],
                      ["cod", "COD"],
                      ["online", "Online"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        updateFilters({ payment: value as AdminOrderPaymentFilter });
                        setShowPaymentMenu(false);
                      }}
                      className="block w-full px-4 py-2 text-left text-sm hover:bg-surface-container"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 xl:min-w-[320px]">
              <div>
                <label
                  htmlFor="orders-date-from"
                  className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant"
                >
                  From
                </label>
                <input
                  id="orders-date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                  className={`${adminFieldClassName} py-2`}
                />
              </div>
              <div>
                <label
                  htmlFor="orders-date-to"
                  className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant"
                >
                  To
                </label>
                <input
                  id="orders-date-to"
                  type="date"
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                  className={`${adminFieldClassName} py-2`}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={applyDateFilters}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-on-primary"
              >
                Apply dates
              </button>
              {activeFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-lg border border-outline-variant px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-on-surface-variant transition-colors hover:bg-surface-container"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>

        <OrdersList orders={data.orders} emptyMessage={emptyMessage} />
      </article>
    </>
  );
}

function OrdersList({
  orders,
  emptyMessage,
}: {
  orders: AdminOrderRow[];
  emptyMessage: string;
}) {
  return (
    <>
      <ul className="divide-y divide-outline-variant md:hidden">
        {orders.length === 0 ? (
          <li className="px-4 py-10 text-center text-sm text-on-surface-variant">{emptyMessage}</li>
        ) : (
          orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/admin/orders/${order.id}`}
                className="block px-4 py-4 transition-colors hover:bg-surface-container"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-primary">#{order.orderNumber}</p>
                    <p className="mt-0.5 truncate text-sm">{order.customer}</p>
                    <p className="mt-0.5 truncate text-xs text-on-surface-variant">{order.email}</p>
                    <p className="mt-2 text-xs text-on-surface-variant">{order.date}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-primary">{order.total}</p>
                    <span
                      className={`mt-2 inline-block rounded-full px-2 py-1 text-[10px] font-semibold ${orderStatusTone(order.statusRaw)}`}
                    >
                      {order.status}
                    </span>
                    <p className="mt-2 text-[10px] uppercase tracking-wider text-on-surface-variant">
                      {order.isCod ? "COD" : "Online"}
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          ))
        )}
      </ul>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-[880px] w-full text-left">
          <thead className="bg-surface-container-high">
            <tr>
              {["Order #", "Customer", "Email", "Date", "Status", "Payment", "Total"].map(
                (heading) => (
                  <th key={heading} className={adminTableHeadCellClass}>
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className={`${adminTableBodyCellClass} py-10 text-center text-on-surface-variant`}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-surface-container">
                  <td className={`${adminTableBodyCellClass} font-medium text-primary`}>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="underline-offset-2 hover:underline"
                    >
                      #{order.orderNumber}
                    </Link>
                  </td>
                  <td className={adminTableBodyCellClass}>
                    <Link href={`/admin/orders/${order.id}`} className="hover:text-primary">
                      {order.customer}
                    </Link>
                  </td>
                  <td className={`${adminTableBodyCellClass} text-on-surface-variant`}>
                    {order.email}
                  </td>
                  <td className={`${adminTableBodyCellClass} text-on-surface-variant`}>
                    {order.date}
                  </td>
                  <td className={adminTableBodyCellClass}>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${orderStatusTone(order.statusRaw)}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className={`${adminTableBodyCellClass} text-on-surface-variant`}>
                    {order.isCod ? "COD" : "Online"}
                  </td>
                  <td className={`${adminTableBodyCellClass} font-semibold text-primary`}>
                    <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                      {order.total}
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
