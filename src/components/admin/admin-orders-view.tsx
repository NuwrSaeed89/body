import type { AdminOrdersData } from "@/lib/admin/list-types";
import {
  adminPageSectionClass,
  adminTableBodyCellClass,
  adminTableHeadCellClass,
} from "./admin-layout-styles";
import { AdminPageHeader } from "./admin-page-header";

type AdminOrdersViewProps = {
  data: AdminOrdersData;
};

function statusTone(statusRaw: string): string {
  if (statusRaw === "delivered" || statusRaw === "shipped") {
    return "bg-surface-container-high text-primary";
  }
  if (statusRaw === "cancelled" || statusRaw === "returned") {
    return "bg-surface-variant text-on-surface";
  }
  if (statusRaw === "pending_payment") {
    return "bg-surface-variant text-on-surface-variant";
  }
  return "bg-primary/10 text-primary";
}

export function AdminOrdersView({ data }: AdminOrdersViewProps) {
  return (
    <section className={adminPageSectionClass}>
      <AdminPageHeader
        title="Orders"
        description="All storefront orders from Supabase. Update fulfillment status from the database or a future admin action."
        source={data.source}
        count={data.totalCount}
        countLabel="orders"
      />

      <article className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low">
        <ul className="divide-y divide-outline-variant md:hidden">
          {data.orders.length === 0 ? (
            <li className="px-4 py-10 text-center text-sm text-on-surface-variant">
              No orders in the database yet. Completed checkouts will appear here.
            </li>
          ) : (
            data.orders.map((order) => (
              <li key={order.id} className="px-4 py-4">
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
                      className={`mt-2 inline-block rounded-full px-2 py-1 text-[10px] font-semibold ${statusTone(order.statusRaw)}`}
                    >
                      {order.status}
                    </span>
                    <p className="mt-2 text-[10px] uppercase tracking-wider text-on-surface-variant">
                      {order.isCod ? "COD" : "Online"}
                    </p>
                  </div>
                </div>
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
              {data.orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className={`${adminTableBodyCellClass} py-10 text-center text-on-surface-variant`}
                  >
                    No orders in the database yet. Completed checkouts will appear here.
                  </td>
                </tr>
              ) : (
                data.orders.map((order) => (
                  <tr key={order.id}>
                    <td className={`${adminTableBodyCellClass} font-medium text-primary`}>
                      #{order.orderNumber}
                    </td>
                    <td className={adminTableBodyCellClass}>{order.customer}</td>
                    <td className={`${adminTableBodyCellClass} text-on-surface-variant`}>
                      {order.email}
                    </td>
                    <td className={`${adminTableBodyCellClass} text-on-surface-variant`}>
                      {order.date}
                    </td>
                    <td className={adminTableBodyCellClass}>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${statusTone(order.statusRaw)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className={`${adminTableBodyCellClass} text-on-surface-variant`}>
                      {order.isCod ? "COD" : "Online"}
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
