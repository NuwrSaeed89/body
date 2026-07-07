import { Shimmer } from "@/components/ui/shimmer";
import { adminCardToolbarClass, adminPageSectionClass } from "./admin-layout-styles";

function FolderCardSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4 text-center">
      <Shimmer className="size-14 rounded-lg" />
      <Shimmer className="h-4 w-20 max-w-full" />
    </div>
  );
}

function FileCardSkeleton() {
  return (
    <article className="overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest">
      <Shimmer className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-2 p-3">
        <Shimmer className="h-4 w-full max-w-[180px]" />
        <Shimmer className="h-3 w-28" />
        <div className="flex gap-2">
          <Shimmer className="h-8 flex-1 rounded-lg" />
          <Shimmer className="h-8 flex-1 rounded-lg" />
        </div>
      </div>
    </article>
  );
}

type AdminMediaContentSkeletonProps = {
  folderCount?: number;
  fileCount?: number;
};

export function AdminMediaContentSkeleton({
  folderCount = 4,
  fileCount = 6,
}: AdminMediaContentSkeletonProps) {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading media">
      {folderCount > 0 && (
        <section>
          <Shimmer className="mb-3 h-3 w-28" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: folderCount }).map((_, index) => (
              <FolderCardSkeleton key={`folder-${index}`} />
            ))}
          </div>
        </section>
      )}

      {fileCount > 0 && (
        <section>
          <Shimmer className="mb-3 h-3 w-24" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: fileCount }).map((_, index) => (
              <FileCardSkeleton key={`file-${index}`} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export function AdminMediaListSkeleton() {
  return (
    <section className={adminPageSectionClass} aria-busy="true" aria-label="Loading media">
      <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Shimmer className="h-7 w-24 sm:h-8" />
            <Shimmer className="h-5 w-20 rounded-full" />
          </div>
          <Shimmer className="h-4 w-full max-w-2xl" />
        </div>
      </header>

      <article className="overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest shadow-[0_30px_50px_-12px_rgba(18,18,18,0.03)]">
        <div className={adminCardToolbarClass}>
          <div className="flex flex-wrap items-center gap-2">
            <Shimmer className="h-4 w-28" />
            <Shimmer className="h-4 w-20" />
          </div>
          <div className="flex gap-2">
            <Shimmer className="h-10 w-16 rounded-lg" />
            <Shimmer className="h-10 w-24 rounded-lg" />
          </div>
        </div>

        <div className="p-4 sm:p-5 md:p-6">
          <AdminMediaContentSkeleton />
        </div>
      </article>
    </section>
  );
}
