import { Shimmer } from "@/components/ui/shimmer";
import { adminPageSectionClass } from "./admin-layout-styles";
import { AdminPageHeaderSkeleton } from "./admin-page-header-skeleton";

function VariantMatrixSkeleton() {
  return (
    <div className="space-y-5 rounded-xl border border-outline-variant bg-surface-container-low p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Shimmer className="h-3 w-36" />
          <Shimmer className="h-3 w-full max-w-lg" />
        </div>
        <Shimmer className="h-10 w-full rounded-lg sm:w-36" />
      </div>

      <div className="space-y-4">
        <div>
          <Shimmer className="h-3 w-40" />
          <Shimmer className="mt-2 h-3 w-72 max-w-full" />
          <div className="mt-3 flex flex-wrap gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Shimmer key={index} className="h-10 w-28 rounded-lg" />
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[480px] space-y-3">
            <div className="grid grid-cols-5 gap-2">
              <Shimmer className="h-8 rounded" />
              {Array.from({ length: 4 }).map((_, index) => (
                <Shimmer key={index} className="h-8 rounded" />
              ))}
            </div>
            {Array.from({ length: 4 }).map((_, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-5 gap-2">
                <Shimmer className="h-10 rounded" />
                {Array.from({ length: 4 }).map((_, colIndex) => (
                  <Shimmer key={colIndex} className="h-10 rounded" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminProductVariantsSkeleton() {
  return (
    <section className={adminPageSectionClass} aria-busy="true" aria-label="Loading product variants">
      <div className="mb-6">
        <Shimmer className="h-4 w-36" />
      </div>

      <AdminPageHeaderSkeleton />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(240px,300px)_minmax(0,1fr)] lg:items-start">
        <aside className="rounded-xl border border-outline-variant bg-surface-container-low p-5 lg:sticky lg:top-24">
          <div className="flex items-start gap-4">
            <Shimmer className="h-12 w-10 shrink-0 rounded" />
            <div className="min-w-0 flex-1 space-y-2">
              <Shimmer className="h-4 w-full max-w-[180px]" />
              <Shimmer className="h-3 w-24" />
            </div>
          </div>

          <dl className="mt-6 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between gap-3">
                <Shimmer className="h-4 w-16" />
                <Shimmer className="h-4 w-20" />
              </div>
            ))}
          </dl>

          <div className="mt-6 border-t border-outline-variant/40 pt-5">
            <Shimmer className="h-10 w-full rounded-lg" />
          </div>
        </aside>

        <div className="min-w-0">
          <VariantMatrixSkeleton />
        </div>
      </div>
    </section>
  );
}

export function AdminVariantMatrixSkeleton() {
  return <VariantMatrixSkeleton />;
}
