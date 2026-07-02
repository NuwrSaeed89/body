import { Shimmer, ShimmerIcon, ShimmerText } from "@/components/ui/shimmer";

function HomeHeaderSkeleton() {
  return (
    <>
      <div className="hidden border-b border-outline-variant/30 bg-surface-container-low md:block">
        <div className="mx-auto flex h-10 max-w-[1440px] items-center justify-between px-5 md:px-16">
          <div className="flex gap-3">
            <Shimmer className="h-4 w-10" />
            <Shimmer className="h-4 w-12" />
          </div>
          <Shimmer className="hidden h-3 w-48 md:block" />
        </div>
      </div>
      <header className="sticky top-0 z-50 border-b border-outline-variant/30 bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 md:px-16">
          <div className="flex items-center gap-4 md:gap-10">
            <ShimmerIcon className="md:hidden" />
            <Shimmer className="h-7 w-20" />
            <div className="ml-0 hidden gap-6 md:ml-12 md:flex">
              {Array.from({ length: 3 }).map((_, i) => (
                <Shimmer key={i} className="h-3 w-14" />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ShimmerIcon />
            <ShimmerIcon className="hidden md:block" />
            <ShimmerIcon className="hidden md:block" />
            <ShimmerIcon />
          </div>
        </div>
      </header>
    </>
  );
}

function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <Shimmer className="mb-4 aspect-[4/5] w-full rounded-lg" />
          <ShimmerText className="mb-2 w-3/4" />
          <ShimmerText className="w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <>
      <HomeHeaderSkeleton />
      <main className="md:pb-0" aria-busy="true" aria-label="Loading homepage">
        <Shimmer className="h-[600px] w-full rounded-none md:h-[870px]" />

        <section className="mx-auto max-w-[1440px] px-5 py-24 md:px-16">
          <div className="mb-12 space-y-2">
            <Shimmer className="h-3 w-28" />
            <Shimmer className="h-8 w-56" />
          </div>
          <ProductGridSkeleton />
        </section>

        <section className="bg-surface-container-low py-24">
          <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-6 px-5 md:h-[800px] md:grid-cols-12 md:px-16">
            <Shimmer className="min-h-[480px] rounded-lg md:col-span-8 md:min-h-0" />
            <div className="flex flex-col gap-6 md:col-span-4">
              <Shimmer className="min-h-[240px] flex-1 rounded-lg" />
              <Shimmer className="min-h-[240px] flex-1 rounded-lg" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-5 py-24 md:px-16">
          <Shimmer className="mx-auto mb-12 h-8 w-64" />
          <ProductGridSkeleton count={4} />
        </section>

        <section className="mx-auto max-w-[1440px] px-5 py-24 md:px-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <Shimmer className="aspect-[4/5] rounded-lg" />
            <div className="flex flex-col justify-center gap-4">
              <Shimmer className="h-3 w-24" />
              <Shimmer className="h-10 w-full max-w-md" />
              <Shimmer className="h-4 w-full max-w-sm" />
              <Shimmer className="h-12 w-40 rounded-lg" />
            </div>
          </div>
        </section>

        <section className="border-t border-outline-variant/30 bg-surface-container-low py-16">
          <div className="mx-auto max-w-xl space-y-4 px-5 text-center md:px-16">
            <Shimmer className="mx-auto h-8 w-48" />
            <Shimmer className="mx-auto h-4 w-full" />
            <Shimmer className="mx-auto h-12 w-full max-w-md rounded-lg" />
          </div>
        </section>
      </main>
    </>
  );
}
