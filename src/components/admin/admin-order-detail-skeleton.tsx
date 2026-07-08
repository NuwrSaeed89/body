import { Shimmer } from "@/components/ui/shimmer";
import { adminPageSectionClass } from "./admin-layout-styles";
import { AdminPageHeaderSkeleton } from "./admin-page-header-skeleton";

export function AdminOrderDetailSkeleton() {
  return (
    <section className={adminPageSectionClass} aria-busy="true" aria-label="Loading order">
      <Shimmer className="mb-6 h-4 w-32" />
      <AdminPageHeaderSkeleton />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)]">
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-outline-variant bg-surface-container-low p-5"
            >
              <Shimmer className="h-3 w-24" />
              <Shimmer className="mt-4 h-5 w-40" />
              <Shimmer className="mt-2 h-4 w-48" />
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low">
            <div className="border-b border-outline-variant/40 px-5 py-4">
              <Shimmer className="h-3 w-24" />
            </div>
            <div className="space-y-4 p-5">
              {Array.from({ length: 3 }).map((_, index) => (
                <Shimmer key={index} className="h-4 w-full" />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-outline-variant bg-surface-container-low p-5">
            <Shimmer className="h-3 w-24" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Shimmer key={index} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
