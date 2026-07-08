import type { AdminDashboardData } from "@/lib/admin/types";
import {
  adminPageSectionClass,
  adminTableBodyCellClass,
  adminTableHeadCellClass,
} from "./admin-layout-styles";
import { AdminPageHeader } from "./admin-page-header";
import { Link } from "@/i18n/navigation";

type AdminOverviewProps = {
  data: AdminDashboardData;
};

export function AdminOverview({ data }: AdminOverviewProps) {
  const { source, metrics, revenueTrends, topCollections, recentOrders, lowStockAlerts } = data;

  const maxBarIndex = revenueTrends.reduce(
    (best, bar, index) =>
      bar.heightPercent > (revenueTrends[best]?.heightPercent ?? 0) ? index : best,
    0,
  );

  return (
    <section className={adminPageSectionClass}>
      <AdminPageHeader
        title="Sales Overview"
        description="Real-time performance tracking for Mbody."
        source={source}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-primary transition-colors hover:bg-surface-container"
        >
          <span className="material-symbols-outlined text-[16px]">home</span>
          View Home
        </Link>
      </AdminPageHeader>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-xl border border-outline-variant bg-surface-container-low p-4 sm:p-5"
          >
            <p className="text-xs uppercase tracking-[0.1em] text-on-surface-variant">
              {metric.label}
            </p>
            <div className="mt-3 flex items-end gap-2">
              <p className="text-2xl font-semibold text-primary">{metric.value}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  metric.trend === "up"
                    ? "bg-surface-container-high text-primary"
                    : "bg-surface-variant text-on-surface"
                }`}
              >
                {metric.delta}
              </span>
            </div>
          </article>
        ))}
      </div>

      {lowStockAlerts.length > 0 && (
        <article className="mt-8 overflow-hidden rounded-xl border border-error/30 bg-error/5">
          <div className="flex flex-col gap-3 border-b border-error/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-error">inventory_2</span>
              <div>
                <h3 className="text-lg font-semibold text-primary">Low-stock alerts</h3>
                <p className="text-sm text-on-surface-variant">
                  {lowStockAlerts.length} product{lowStockAlerts.length === 1 ? "" : "s"} need attention
                </p>
              </div>
            </div>
            <Link
              href="/admin/products"
              className="inline-flex items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-primary transition-colors hover:bg-surface-container"
            >
              Manage inventory
            </Link>
          </div>
          <ul className="divide-y divide-error/10">
            {lowStockAlerts.map((alert) => (
              <li key={alert.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                <div className="h-10 w-8 shrink-0 overflow-hidden rounded bg-surface-container">
                  {alert.imageUrl ? (
                    <img
                      src={alert.imageUrl}
                      alt=""
                      className="size-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <span className="material-symbols-outlined text-sm text-on-surface-variant">
                        image
                      </span>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-primary">{alert.name}</p>
                  <p className="text-xs text-on-surface-variant">
                    {alert.stock} in stock · alert at ≤ {alert.lowStockThreshold}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    alert.status === "out"
                      ? "bg-surface-variant text-on-surface"
                      : "bg-error/15 text-error"
                  }`}
                >
                  {alert.status === "out" ? "Out of stock" : "Low stock"}
                </span>
              </li>
            ))}
          </ul>
        </article>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <article className="rounded-xl border border-outline-variant bg-surface-container-low p-4 sm:p-6 xl:col-span-2">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-primary">Revenue Trends</h3>
            <button
              type="button"
              className="w-full rounded-full border border-outline-variant px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] sm:w-auto"
            >
              Export CSV
            </button>
          </div>
          <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="min-w-[320px]">
              <div className="flex h-40 items-end gap-2 sm:h-48">
                {revenueTrends.map((bar, index) => (
                  <div
                    key={`${bar.month}-${index}`}
                    className={`flex-1 rounded-t ${
                      index === maxBarIndex ? "bg-primary/30" : "bg-primary/15"
                    }`}
                    style={{ height: `${bar.heightPercent}%` }}
                    title={`${bar.month}: ${bar.amountLabel}`}
                  />
                ))}
              </div>
              <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-[0.08em] text-on-surface-variant sm:text-[11px] sm:tracking-[0.1em]">
                {revenueTrends.map((bar) => (
                  <span key={bar.month} className="truncate">
                    {bar.month}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </article>

        <article className="rounded-xl border border-outline-variant bg-surface-container-low p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-primary">Top Products</h3>
          <div className="mt-6 space-y-4">
            {topCollections.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No product sales yet.</p>
            ) : (
              topCollections.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-primary">{item.name}</p>
                    <p className="text-xs uppercase tracking-[0.1em] text-on-surface-variant">
                      {item.group}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-primary">{item.orders}</p>
                </div>
              ))
            )}
          </div>
        </article>
      </div>

      <article className="mt-8 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low">
        <div className="border-b border-outline-variant px-4 py-4 sm:px-5">
          <h3 className="text-lg font-semibold text-primary">Recent Orders</h3>
        </div>

        <ul className="divide-y divide-outline-variant md:hidden">
          {recentOrders.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-on-surface-variant">No orders yet.</li>
          ) : (
            recentOrders.map((order) => (
              <li key={order.id} className="px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-primary">{order.id}</p>
                    <p className="mt-0.5 truncate text-sm">{order.customer}</p>
                    <p className="mt-1 text-xs text-on-surface-variant">{order.date}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-primary">{order.total}</p>
                    <span className="mt-2 inline-block rounded-full bg-surface-container-high px-2 py-1 text-[10px] font-semibold text-primary">
                      {order.status}
                    </span>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>

        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-[640px] w-full text-left">
            <thead className="bg-surface-container-high">
              <tr>
                {["Order ID", "Customer", "Date", "Status", "Total"].map((heading) => (
                  <th key={heading} className={adminTableHeadCellClass}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {recentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className={`${adminTableBodyCellClass} py-8 text-center text-on-surface-variant`}
                  >
                    No orders yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className={`${adminTableBodyCellClass} font-medium text-primary`}>
                      {order.id}
                    </td>
                    <td className={adminTableBodyCellClass}>{order.customer}</td>
                    <td className={`${adminTableBodyCellClass} text-on-surface-variant`}>
                      {order.date}
                    </td>
                    <td className={adminTableBodyCellClass}>
                      <span className="rounded-full bg-surface-container-high px-2 py-1 text-xs font-semibold text-primary">
                        {order.status}
                      </span>
                    </td>
                    <td className={`${adminTableBodyCellClass} font-semibold text-primary`}>
                      {order.total}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
