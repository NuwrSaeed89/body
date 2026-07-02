function SkeletonLine({ className }: { className: string }) {
  return <div className={`soft-shimmer rounded ${className}`} />;
}

export function AdminDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-surface md:ml-64">
      <header className="border-b border-outline-variant px-4 py-3 md:hidden">
        <SkeletonLine className="h-5 w-28" />
        <SkeletonLine className="mt-2 h-3 w-36" />
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonLine key={i} className="h-8 w-24 shrink-0 rounded-full" />
          ))}
        </div>
      </header>

      <section className="min-w-0 flex-1 p-4 sm:p-5 md:p-8">
        <header className="mb-6 flex flex-col gap-4 border-b border-outline-variant pb-4 sm:mb-8 sm:pb-5">
          <div className="space-y-2">
            <SkeletonLine className="h-8 w-48 sm:h-9" />
            <SkeletonLine className="h-4 w-full max-w-md" />
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <article
              key={i}
              className="rounded-xl border border-outline-variant bg-surface-container-low p-4 sm:p-5"
            >
              <SkeletonLine className="h-3 w-28" />
              <SkeletonLine className="mt-4 h-8 w-36" />
              <SkeletonLine className="mt-3 h-4 w-16 rounded-full" />
            </article>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-3">
          <article className="rounded-xl border border-outline-variant bg-surface-container-low p-4 sm:p-6 xl:col-span-2">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <SkeletonLine className="h-6 w-40" />
              <SkeletonLine className="h-8 w-24 rounded-full" />
            </div>
            <SkeletonLine className="h-40 w-full rounded-lg sm:h-48" />
            <div className="mt-3 grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <SkeletonLine key={i} className="h-3 w-full" />
              ))}
            </div>
          </article>

          <article className="rounded-xl border border-outline-variant bg-surface-container-low p-4 sm:p-6">
            <SkeletonLine className="h-6 w-32" />
            <div className="mt-6 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <SkeletonLine className="h-4 w-40" />
                  <SkeletonLine className="h-3 w-24" />
                </div>
              ))}
            </div>
          </article>
        </div>

        <article className="mt-8 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low">
          <div className="border-b border-outline-variant px-4 py-4 sm:px-5">
            <SkeletonLine className="h-6 w-48" />
          </div>
          <div className="space-y-3 p-4 sm:p-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonLine key={i} className="h-14 w-full rounded-lg md:h-10" />
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
