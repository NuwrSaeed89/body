import { Shimmer } from "@/components/ui/shimmer";
import { adminPageSectionClass } from "./admin-layout-styles";

export function AdminShippingRatesListSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <section className={adminPageSectionClass} aria-busy="true" aria-label="Loading shipping rates">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Shimmer className="h-7 w-48" />
          <Shimmer className="h-4 w-80 max-w-full" />
        </div>
        <Shimmer className="h-11 w-36 rounded-lg" />
      </div>

      <article className="overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest">
        <div className="flex flex-col gap-4 border-b border-outline-variant/30 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <Shimmer className="h-10 w-full max-w-md rounded-lg" />
          <div className="flex gap-3">
            <Shimmer className="h-10 w-28 rounded-lg" />
            <Shimmer className="h-10 w-28 rounded-lg" />
            <Shimmer className="h-10 w-28 rounded-lg" />
          </div>
        </div>
        <div className="divide-y divide-outline-variant/20">
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="flex items-center justify-between gap-4 px-4 py-4">
              <div className="space-y-2">
                <Shimmer className="h-4 w-36" />
                <Shimmer className="h-3 w-52" />
              </div>
              <Shimmer className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
