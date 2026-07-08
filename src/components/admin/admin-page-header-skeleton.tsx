import { Shimmer } from "@/components/ui/shimmer";

type AdminPageHeaderSkeletonProps = {
  showBadge?: boolean;
  showCount?: boolean;
  showAction?: boolean;
};

export function AdminPageHeaderSkeleton({
  showBadge = true,
  showCount = false,
  showAction = false,
}: AdminPageHeaderSkeletonProps) {
  return (
    <header className="mb-6 flex flex-col gap-4 border-b border-outline-variant pb-4 sm:mb-8 sm:pb-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Shimmer className="h-7 w-44 sm:h-8 sm:w-52 md:h-9 md:w-56" />
          {showBadge ? <Shimmer className="h-5 w-20 rounded-full" /> : null}
          {showCount ? <Shimmer className="h-3 w-20" /> : null}
        </div>
        <Shimmer className="h-4 w-full max-w-md" />
      </div>
      {showAction ? <Shimmer className="h-12 w-full rounded-lg sm:w-44" /> : null}
    </header>
  );
}
