import type { ReactNode } from "react";
import { AdminSourceBadge } from "./admin-source-badge";

type AdminPageHeaderProps = {
  title: string;
  description: string;
  source: "supabase" | "mock";
  count?: number;
  countLabel?: string;
  children?: ReactNode;
};

export function AdminPageHeader({
  title,
  description,
  source,
  count,
  countLabel = "items",
  children,
}: AdminPageHeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-4 border-b border-outline-variant pb-4 sm:mb-8 sm:pb-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold text-primary sm:text-2xl md:text-3xl">{title}</h2>
          <AdminSourceBadge source={source} />
          {count !== undefined && (
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
              {count} {countLabel}
            </span>
          )}
        </div>
        <p className="text-sm leading-relaxed text-on-surface-variant">{description}</p>
      </div>
      {children ? <div className="shrink-0">{children}</div> : null}
    </header>
  );
}
