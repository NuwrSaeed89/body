import { Shimmer } from "@/components/ui/shimmer";
import { adminCardToolbarClass, adminPageSectionClass } from "./admin-layout-styles";
import { AdminPageHeaderSkeleton } from "./admin-page-header-skeleton";

const TABLE_HEAD_CLASS =
  "px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-on-surface-variant";

function CategoryMobileRowSkeleton() {
  return (
    <li className="px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Shimmer className="h-4 w-40 max-w-full" />
          <Shimmer className="h-3 w-28 max-w-full" />
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Shimmer className="h-3 w-16 rounded-full" />
            <Shimmer className="h-3 w-16" />
            <Shimmer className="h-3 w-20" />
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <Shimmer className="size-8 rounded-full" />
          <Shimmer className="size-8 rounded-full" />
        </div>
      </div>
    </li>
  );
}

function CategoryTableRowSkeleton() {
  return (
    <tr>
      <td className="px-6 py-3 align-middle">
        <Shimmer className="h-4 w-36 max-w-full" />
      </td>
      <td className="px-6 py-3 align-middle">
        <Shimmer className="h-3 w-28" />
      </td>
      <td className="px-6 py-3 align-middle">
        <Shimmer className="h-4 w-8" />
      </td>
      <td className="px-6 py-3 align-middle">
        <Shimmer className="h-4 w-10" />
      </td>
      <td className="px-6 py-3 align-middle">
        <Shimmer className="h-3 w-16 rounded-full" />
      </td>
      <td className="px-6 py-3 align-middle text-right">
        <div className="flex justify-end gap-1">
          <Shimmer className="size-8 rounded-full" />
          <Shimmer className="size-8 rounded-full" />
        </div>
      </td>
    </tr>
  );
}

export function AdminCategoriesListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <section className={adminPageSectionClass} aria-busy="true" aria-label="Loading categories">
      <AdminPageHeaderSkeleton showBadge={false} showAction />

      <article className="mb-6 overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest shadow-[0_30px_50px_-12px_rgba(18,18,18,0.03)] sm:mb-8">
        <div className={adminCardToolbarClass}>
          <Shimmer className="h-10 w-full rounded-lg sm:max-w-md" />
          <Shimmer className="h-10 w-full rounded-lg sm:w-36" />
        </div>

        <ul className="divide-y divide-outline-variant/20 md:hidden">
          {Array.from({ length: rows }).map((_, index) => (
            <CategoryMobileRowSkeleton key={index} />
          ))}
        </ul>

        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead className="border-b border-outline-variant/30 bg-surface-container-low/50">
                <tr>
                  <th className={TABLE_HEAD_CLASS}>Name</th>
                  <th className={TABLE_HEAD_CLASS}>Slug</th>
                  <th className={TABLE_HEAD_CLASS}>Order</th>
                  <th className={TABLE_HEAD_CLASS}>Products</th>
                  <th className={TABLE_HEAD_CLASS}>Status</th>
                  <th className={`${TABLE_HEAD_CLASS} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {Array.from({ length: rows }).map((_, index) => (
                  <CategoryTableRowSkeleton key={index} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </article>
    </section>
  );
}
