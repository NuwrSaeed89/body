import { formatCompactCount } from "@/lib/admin/format";

export type ProductEngagementStats = {
  views: number;
  likes: number;
  waitingCount: number;
  unitsSold: number;
};

type AdminProductEngagementPanelProps = {
  stats: ProductEngagementStats;
  /** Compact inline strip for tables / mobile rows */
  compact?: boolean;
  className?: string;
};

const METRICS = [
  { key: "views", label: "Views", icon: "visibility", getValue: (s: ProductEngagementStats) => s.views },
  { key: "likes", label: "Likes", icon: "favorite", getValue: (s: ProductEngagementStats) => s.likes },
  {
    key: "waiting",
    label: "Waiting",
    icon: "notifications",
    getValue: (s: ProductEngagementStats) => s.waitingCount,
  },
  {
    key: "sold",
    label: "Sold",
    icon: "local_shipping",
    getValue: (s: ProductEngagementStats) => s.unitsSold,
  },
] as const;

export function productEngagementFromRow(row: {
  views: number;
  likes: number;
  waitingCount: number;
  unitsSold: number;
}): ProductEngagementStats {
  return {
    views: row.views,
    likes: row.likes,
    waitingCount: row.waitingCount,
    unitsSold: row.unitsSold,
  };
}

export function AdminProductEngagementPanel({
  stats,
  compact = false,
  className = "",
}: AdminProductEngagementPanelProps) {
  if (compact) {
    return (
      <div
        className={`flex flex-wrap items-center gap-2 text-on-surface-variant ${className}`}
        role="group"
        aria-label="Product engagement"
      >
        {METRICS.map((metric) => {
          const value = formatCompactCount(metric.getValue(stats));
          return (
            <span
              key={metric.key}
              className="inline-flex items-center gap-0.5"
              title={`${metric.label}: ${value}`}
            >
              <span className="material-symbols-outlined text-[13px] leading-none" aria-hidden>
                {metric.icon}
              </span>
              <span className="text-[10px] font-medium tabular-nums leading-none text-primary">
                {value}
              </span>
              <span className="sr-only">
                {metric.label}: {value}
              </span>
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <div className={className}>
      <h4 className="mb-1 text-xs font-semibold uppercase tracking-[0.1em] text-primary">
        Engagement
      </h4>
      <p className="mb-3 text-xs text-on-surface-variant">
        Live storefront counters for this product — views, wishlist likes, waiting list, and units sold.
      </p>
      <div
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
        role="group"
        aria-label="Product engagement"
      >
        {METRICS.map((metric) => (
          <div
            key={metric.key}
            className="rounded-lg border border-outline-variant/50 bg-surface-container-low px-3 py-3"
          >
            <div className="mb-2 flex items-center gap-1.5 text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]" aria-hidden>
                {metric.icon}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em]">
                {metric.label}
              </span>
            </div>
            <p className="text-lg font-semibold tabular-nums tracking-tight text-primary">
              {formatCompactCount(metric.getValue(stats))}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
