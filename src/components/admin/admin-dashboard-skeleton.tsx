function SkeletonLine({ className }: { className: string }) {
  return <div className={`soft-shimmer rounded ${className}`} />;
}

export function AdminDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto flex w-full max-w-[1440px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-outline-variant bg-surface-container-low p-6 lg:flex lg:flex-col">
          <SkeletonLine className="h-7 w-32" />
          <SkeletonLine className="mt-3 h-3 w-40" />
          <div className="mt-8 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonLine key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
          <div className="mt-auto border-t border-outline-variant pt-4">
            <SkeletonLine className="h-4 w-28" />
            <SkeletonLine className="mt-2 h-3 w-24" />
          </div>
        </aside>

        <section className="min-w-0 flex-1 p-5 md:p-8">
          <header className="mb-8 flex flex-col gap-4 border-b border-outline-variant pb-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <SkeletonLine className="h-9 w-56" />
              <SkeletonLine className="h-4 w-80 max-w-full" />
            </div>
            <SkeletonLine className="h-11 w-full rounded-lg md:w-80" />
          </header>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <article key={i} className="rounded-xl border border-outline-variant bg-surface-container-low p-5">
                <SkeletonLine className="h-3 w-28" />
                <SkeletonLine className="mt-4 h-8 w-36" />
                <SkeletonLine className="mt-3 h-4 w-16 rounded-full" />
              </article>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <article className="rounded-xl border border-outline-variant bg-surface-container-low p-6 xl:col-span-2">
              <div className="mb-5 flex items-center justify-between">
                <SkeletonLine className="h-6 w-40" />
                <SkeletonLine className="h-8 w-24 rounded-full" />
              </div>
              <SkeletonLine className="h-48 w-full rounded-lg" />
              <div className="mt-3 grid grid-cols-7 gap-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <SkeletonLine key={i} className="h-3 w-full" />
                ))}
              </div>
            </article>

            <article className="rounded-xl border border-outline-variant bg-surface-container-low p-6">
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
            <div className="flex items-center justify-between border-b border-outline-variant px-5 py-4">
              <SkeletonLine className="h-6 w-48" />
              <SkeletonLine className="h-4 w-16" />
            </div>
            <div className="space-y-3 p-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonLine key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
