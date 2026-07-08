import { Shimmer } from "@/components/ui/shimmer";
import { adminCardToolbarClass, adminPageSectionClass } from "./admin-layout-styles";
import { AdminPageHeaderSkeleton } from "./admin-page-header-skeleton";

const TABLE_HEAD_CLASS =
  "px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-on-surface-variant";

function ProductMobileRowSkeleton() {
  return (
    <li className="px-4 py-4">
      <div className="flex items-start gap-3">
        <Shimmer className="h-12 w-10 shrink-0 rounded" />
        <div className="min-w-0 flex-1 space-y-2">
          <Shimmer className="h-4 w-3/4 max-w-[200px]" />
          <Shimmer className="h-3 w-1/2 max-w-[140px]" />
          <Shimmer className="h-3 w-24" />
          <div className="flex items-center justify-between gap-2 pt-1">
            <Shimmer className="h-4 w-16" />
            <Shimmer className="h-3 w-20 rounded-full" />
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

function ProductTableRowSkeleton() {
  return (
    <tr>
      <td className="px-6 py-3 align-middle">
        <div className="flex min-w-0 items-center gap-3">
          <Shimmer className="h-12 w-10 shrink-0 rounded" />
          <Shimmer className="h-4 w-32 max-w-full" />
        </div>
      </td>
      <td className="px-6 py-3 align-middle">
        <Shimmer className="h-3 w-24" />
      </td>
      <td className="px-6 py-3 align-middle">
        <Shimmer className="h-3 w-20" />
      </td>
      <td className="px-6 py-3 align-middle">
        <Shimmer className="h-4 w-14" />
      </td>
      <td className="px-6 py-3 align-middle">
        <Shimmer className="h-3 w-20 rounded-full" />
      </td>
      <td className="px-6 py-3 align-middle text-right">
        <div className="flex items-center justify-end gap-1">
          <Shimmer className="size-8 rounded-full" />
          <Shimmer className="size-8 rounded-full" />
        </div>
      </td>
    </tr>
  );
}

export function AdminProductsListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <section className={adminPageSectionClass} aria-busy="true" aria-label="Loading products">
      <AdminPageHeaderSkeleton showBadge={false} showAction />

      <article className="mb-6 overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest shadow-[0_30px_50px_-12px_rgba(18,18,18,0.03)] sm:mb-8">
        <div className={adminCardToolbarClass}>
          <Shimmer className="h-10 w-full rounded-lg sm:max-w-md" />
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Shimmer className="h-10 w-full rounded-lg sm:w-36" />
            <Shimmer className="h-10 w-full rounded-lg sm:w-36" />
          </div>
        </div>

        <ul className="divide-y divide-outline-variant/20 md:hidden">
          {Array.from({ length: rows }).map((_, index) => (
            <ProductMobileRowSkeleton key={index} />
          ))}
        </ul>

        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed border-collapse text-left">
              <colgroup>
                <col style={{ width: "34%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "10%" }} />
              </colgroup>
              <thead className="bg-surface-container-low">
                <tr>
                  <th className={TABLE_HEAD_CLASS}>Product</th>
                  <th className={TABLE_HEAD_CLASS}>SKU</th>
                  <th className={TABLE_HEAD_CLASS}>Category</th>
                  <th className={TABLE_HEAD_CLASS}>Price</th>
                  <th className={TABLE_HEAD_CLASS}>Stock</th>
                  <th className={`${TABLE_HEAD_CLASS} text-right`}>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {Array.from({ length: rows }).map((_, index) => (
                  <ProductTableRowSkeleton key={index} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </article>
    </section>
  );
}
