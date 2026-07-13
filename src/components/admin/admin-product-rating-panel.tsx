import { formatCompactCount } from "@/lib/admin/format";
import { StarRatingDisplay } from "@/components/pdp/star-rating-display";

export type ProductRatingStats = {
  average: number;
  count: number;
};

type AdminProductRatingPanelProps = {
  stats: ProductRatingStats;
  /** Compact inline strip for tables / mobile rows */
  compact?: boolean;
  className?: string;
};

export function productRatingFromRow(row: {
  ratingAverage: number;
  ratingCount: number;
}): ProductRatingStats {
  return {
    average: row.ratingAverage,
    count: row.ratingCount,
  };
}

export function AdminProductRatingPanel({
  stats,
  compact = false,
  className = "",
}: AdminProductRatingPanelProps) {
  const hasRatings = stats.count > 0;
  const averageLabel = hasRatings ? stats.average.toFixed(1) : "—";
  const countLabel = formatCompactCount(stats.count);

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1 text-on-surface-variant ${className}`}
        title={
          hasRatings
            ? `Average ${averageLabel} · ${countLabel} ratings`
            : "No ratings yet"
        }
        role="group"
        aria-label={
          hasRatings
            ? `Star rating ${averageLabel} from ${stats.count} ratings`
            : "No star ratings"
        }
      >
        <StarRatingDisplay average={hasRatings ? stats.average : 0} size="sm" />
        <span className="text-[10px] font-medium tabular-nums text-primary">{averageLabel}</span>
        <span className="text-[10px] tabular-nums">({countLabel})</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <h4 className="mb-1 text-xs font-semibold uppercase tracking-[0.1em] text-primary">
        Star ratings
      </h4>
      <p className="mb-3 text-xs text-on-surface-variant">
        Read-only average from verified buyer ratings (1–5 stars). No text or photo reviews.
      </p>
      <div className="rounded-lg border border-outline-variant/50 bg-surface-container-low px-4 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <StarRatingDisplay average={hasRatings ? stats.average : 0} size="md" />
          <div>
            <p className="text-2xl font-semibold tabular-nums tracking-tight text-primary">
              {averageLabel}
            </p>
            <p className="text-xs text-on-surface-variant">
              {hasRatings ? `${countLabel} ratings` : "No ratings yet"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
