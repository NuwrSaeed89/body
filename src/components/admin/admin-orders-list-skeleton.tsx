import { Shimmer } from "@/components/ui/shimmer";
import {
  adminPageSectionClass,
  adminTableBodyCellClass,
  adminTableHeadCellClass,
} from "./admin-layout-styles";
import { AdminPageHeaderSkeleton } from "./admin-page-header-skeleton";

function OrderMobileRowSkeleton() {
  return (
    <li className="px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Shimmer className="h-4 w-20" />
          <Shimmer className="h-4 w-36 max-w-full" />
          <Shimmer className="h-3 w-44 max-w-full" />
          <Shimmer className="h-3 w-28" />
        </div>
        <div className="shrink-0 space-y-2 text-right">
          <Shimmer className="ml-auto h-4 w-16" />
          <Shimmer className="ml-auto h-6 w-24 rounded-full" />
          <Shimmer className="ml-auto h-3 w-12" />
        </div>
      </div>
    </li>
  );
}

function OrderTableRowSkeleton() {
  return (
    <tr>
      <td className={`${adminTableBodyCellClass} align-middle`}>
        <Shimmer className="h-4 w-20" />
      </td>
      <td className={`${adminTableBodyCellClass} align-middle`}>
        <Shimmer className="h-4 w-32 max-w-full" />
      </td>
      <td className={`${adminTableBodyCellClass} align-middle`}>
        <Shimmer className="h-4 w-40 max-w-full" />
      </td>
      <td className={`${adminTableBodyCellClass} align-middle`}>
        <Shimmer className="h-4 w-28" />
      </td>
      <td className={`${adminTableBodyCellClass} align-middle`}>
        <Shimmer className="h-6 w-24 rounded-full" />
      </td>
      <td className={`${adminTableBodyCellClass} align-middle`}>
        <Shimmer className="h-4 w-14" />
      </td>
      <td className={`${adminTableBodyCellClass} align-middle`}>
        <Shimmer className="h-4 w-16" />
      </td>
    </tr>
  );
}

export function AdminOrdersListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <section className={adminPageSectionClass} aria-busy="true" aria-label="Loading orders">
      <AdminPageHeaderSkeleton showCount />

      <article className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low">
        <ul className="divide-y divide-outline-variant md:hidden">
          {Array.from({ length: rows }).map((_, index) => (
            <OrderMobileRowSkeleton key={index} />
          ))}
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
              {Array.from({ length: rows }).map((_, index) => (
                <OrderTableRowSkeleton key={index} />
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
