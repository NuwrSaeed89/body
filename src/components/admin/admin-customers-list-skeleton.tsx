import { Shimmer } from "@/components/ui/shimmer";
import {
  adminPageSectionClass,
  adminTableBodyCellClass,
  adminTableHeadCellClass,
} from "./admin-layout-styles";
import { AdminPageHeaderSkeleton } from "./admin-page-header-skeleton";

function CustomerMobileRowSkeleton() {
  return (
    <li className="px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Shimmer className="h-4 w-36 max-w-full" />
          <Shimmer className="h-3 w-44 max-w-full" />
          <Shimmer className="h-3 w-28" />
        </div>
        <div className="shrink-0 space-y-2 text-right">
          <Shimmer className="ml-auto h-6 w-16 rounded-full" />
          <Shimmer className="ml-auto h-3 w-20" />
        </div>
      </div>
    </li>
  );
}

function CustomerTableRowSkeleton() {
  return (
    <tr>
      <td className={`${adminTableBodyCellClass} align-middle`}>
        <Shimmer className="h-4 w-32 max-w-full" />
      </td>
      <td className={`${adminTableBodyCellClass} align-middle`}>
        <Shimmer className="h-4 w-44 max-w-full" />
      </td>
      <td className={`${adminTableBodyCellClass} align-middle`}>
        <Shimmer className="h-6 w-16 rounded-full" />
      </td>
      <td className={`${adminTableBodyCellClass} align-middle`}>
        <Shimmer className="h-4 w-10" />
      </td>
      <td className={`${adminTableBodyCellClass} align-middle`}>
        <Shimmer className="h-4 w-12" />
      </td>
      <td className={`${adminTableBodyCellClass} align-middle`}>
        <Shimmer className="h-4 w-28" />
      </td>
    </tr>
  );
}

export function AdminCustomersListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <section className={adminPageSectionClass} aria-busy="true" aria-label="Loading customers">
      <AdminPageHeaderSkeleton showCount />

      <article className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low">
        <ul className="divide-y divide-outline-variant md:hidden">
          {Array.from({ length: rows }).map((_, index) => (
            <CustomerMobileRowSkeleton key={index} />
          ))}
        </ul>

        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-[760px] w-full text-left">
            <thead className="bg-surface-container-high">
              <tr>
                {["Name", "Email", "Role", "Locale", "Currency", "Joined"].map((heading) => (
                  <th key={heading} className={adminTableHeadCellClass}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {Array.from({ length: rows }).map((_, index) => (
                <CustomerTableRowSkeleton key={index} />
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
