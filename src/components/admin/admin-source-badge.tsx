type AdminSourceBadgeProps = {
  source: "supabase" | "mock";
};

export function AdminSourceBadge({ source }: AdminSourceBadgeProps) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
        source === "supabase"
          ? "bg-surface-container-high text-primary"
          : "bg-surface-variant text-on-surface-variant"
      }`}
    >
      {source === "supabase" ? "Live · Supabase" : "Mock data"}
    </span>
  );
}
