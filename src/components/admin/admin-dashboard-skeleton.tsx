import { Shimmer } from "@/components/ui/shimmer";
import {
  adminPageSectionClass,
  adminTableBodyCellClass,
  adminTableHeadCellClass,
} from "./admin-layout-styles";
import { AdminPageHeaderSkeleton } from "./admin-page-header-skeleton";

const REVENUE_BAR_HEIGHTS = [45, 72, 38, 90, 55, 68, 42];

function MetricCardSkeleton() {
  return (
    <article className="rounded-xl border border-outline-variant bg-surface-container-low p-4 sm:p-5">
      <Shimmer className="h-3 w-28" />
      <div className="mt-3 flex items-end gap-2">
        <Shimmer className="h-8 w-24" />
        <Shimmer className="h-5 w-12 rounded-full" />
      </div>
    </article>
  );
}

function LowStockAlertRowSkeleton() {
  return (
    <li className="flex items-center gap-3 px-4 py-3 sm:px-5">
      <Shimmer className="h-10 w-8 shrink-0 rounded" />
      <div className="min-w-0 flex-1 space-y-2">
        <Shimmer className="h-4 w-40 max-w-full" />
        <Shimmer className="h-3 w-52 max-w-full" />
      </div>
      <Shimmer className="h-6 w-20 shrink-0 rounded-full" />
    </li>
  );
}

function TopProductRowSkeleton() {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="space-y-2">
        <Shimmer className="h-4 w-32 max-w-full" />
        <Shimmer className="h-3 w-20" />
      </div>
      <Shimmer className="h-4 w-8 shrink-0" />
    </div>
  );
}

function RecentOrderMobileRowSkeleton() {
  return (
    <li className="px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Shimmer className="h-4 w-24" />
          <Shimmer className="h-4 w-36 max-w-full" />
          <Shimmer className="h-3 w-28" />
        </div>
        <div className="shrink-0 space-y-2 text-right">
          <Shimmer className="ml-auto h-4 w-16" />
          <Shimmer className="ml-auto h-6 w-20 rounded-full" />
        </div>
      </div>
    </li>
  );
}

function RecentOrderTableRowSkeleton() {
  return (
    <tr>
      <td className={`${adminTableBodyCellClass} align-middle`}>
        <Shimmer className="h-4 w-24" />
      </td>
      <td className={`${adminTableBodyCellClass} align-middle`}>
        <Shimmer className="h-4 w-32 max-w-full" />
      </td>
      <td className={`${adminTableBodyCellClass} align-middle`}>
        <Shimmer className="h-4 w-28" />
      </td>
      <td className={`${adminTableBodyCellClass} align-middle`}>
        <Shimmer className="h-6 w-20 rounded-full" />
      </td>
      <td className={`${adminTableBodyCellClass} align-middle`}>
        <Shimmer className="h-4 w-16" />
      </td>
    </tr>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <section className={adminPageSectionClass} aria-busy="true" aria-label="Loading dashboard">
      <AdminPageHeaderSkeleton />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <MetricCardSkeleton key={index} />
        ))}
      </div>

      <article className="mt-8 overflow-hidden rounded-xl border border-error/30 bg-error/5">
        <div className="flex flex-col gap-3 border-b border-error/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center gap-2">
            <Shimmer className="size-6 shrink-0 rounded" />
            <div className="space-y-2">
              <Shimmer className="h-5 w-36" />
              <Shimmer className="h-3 w-48 max-w-full" />
            </div>
          </div>
          <Shimmer className="h-9 w-full rounded-lg sm:w-40" />
        </div>
        <ul className="divide-y divide-error/10">
          {Array.from({ length: 2 }).map((_, index) => (
            <LowStockAlertRowSkeleton key={index} />
          ))}
        </ul>
      </article>

      <div className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <article className="rounded-xl border border-outline-variant bg-surface-container-low p-4 sm:p-6 xl:col-span-2">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Shimmer className="h-6 w-40" />
            <Shimmer className="h-8 w-full rounded-full sm:w-28" />
          </div>
          <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="min-w-[320px]">
              <div className="flex h-40 items-end gap-2 sm:h-48">
                {REVENUE_BAR_HEIGHTS.map((height, index) => (
                  <div key={index} className="flex flex-1 flex-col justify-end self-stretch">
                    <Shimmer className="w-full rounded-t" style={{ height: `${height}%` }} />
                  </div>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-7 gap-1">
                {Array.from({ length: 7 }).map((_, index) => (
                  <Shimmer key={index} className="mx-auto h-3 w-full max-w-[2.5rem]" />
                ))}
              </div>
            </div>
          </div>
        </article>

        <article className="rounded-xl border border-outline-variant bg-surface-container-low p-4 sm:p-6">
          <Shimmer className="h-6 w-32" />
          <div className="mt-6 space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <TopProductRowSkeleton key={index} />
            ))}
          </div>
        </article>
      </div>

      <article className="mt-8 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low">
        <div className="border-b border-outline-variant px-4 py-4 sm:px-5">
          <Shimmer className="h-6 w-36" />
        </div>

        <ul className="divide-y divide-outline-variant md:hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <RecentOrderMobileRowSkeleton key={index} />
          ))}
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
              {Array.from({ length: 4 }).map((_, index) => (
                <RecentOrderTableRowSkeleton key={index} />
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
