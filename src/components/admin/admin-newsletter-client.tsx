"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { AdminNewsletterRow } from "@/lib/admin/newsletter/types";
import type { EspConfigStatus } from "@/lib/newsletter/esp/types";
import {
  adminCardToolbarClass,
  adminPageSectionClass,
  adminTableBodyCellClass,
  adminTableHeadCellClass,
} from "./admin-layout-styles";
import { AdminPageHeader } from "./admin-page-header";

type AdminNewsletterClientProps = {
  subscribers: AdminNewsletterRow[];
  source: "supabase" | "mock";
  totalCount: number;
  pendingConfirmationCount: number;
  pendingEspSyncCount: number;
  esp: EspConfigStatus;
};

type SyncSummary = {
  synced: number;
  failed: number;
  skipped: number;
  errors?: string[];
};

export function AdminNewsletterClient({
  subscribers,
  source,
  totalCount,
  pendingConfirmationCount,
  pendingEspSyncCount,
  esp,
}: AdminNewsletterClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"all" | AdminNewsletterRow["source"]>("all");
  const [espFilter, setEspFilter] = useState<"all" | "awaiting" | "pending" | "synced">("all");
  const [syncing, setSyncing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const canSync = source === "supabase" && esp.configured && pendingEspSyncCount > 0;

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return subscribers.filter((row) => {
      const matchesQuery =
        !query ||
        row.email.toLowerCase().includes(query) ||
        row.locale.toLowerCase().includes(query);
      const matchesSource = sourceFilter === "all" || row.source === sourceFilter;
      const matchesEsp =
        espFilter === "all" ||
        (espFilter === "awaiting" && !row.confirmed) ||
        (espFilter === "pending" && row.confirmed && !row.syncedToEsp) ||
        (espFilter === "synced" && row.syncedToEsp);
      return matchesQuery && matchesSource && matchesEsp;
    });
  }, [subscribers, searchQuery, sourceFilter, espFilter]);

  const emptyMessage =
    subscribers.length === 0
      ? "No newsletter subscribers yet. Signups from the homepage and cart footer will appear here."
      : "No subscribers match your filters.";

  const handleSync = async () => {
    setSyncing(true);
    setActionError(null);
    setSyncMessage(null);

    try {
      const response = await fetch("/api/admin/newsletter/sync", { method: "POST" });
      const body = (await response.json()) as SyncSummary & { error?: string };
      if (!response.ok) {
        setActionError(body.error ?? "ESP sync failed");
        return;
      }

      const parts = [`${body.synced} synced`];
      if (body.failed > 0) parts.push(`${body.failed} failed`);
      setSyncMessage(parts.join(", "));
      router.refresh();
    } catch {
      setActionError("Network error — could not sync to ESP");
    } finally {
      setSyncing(false);
    }
  };

  const espHint =
    esp.provider === "none"
      ? "Set NEWSLETTER_ESP=klaviyo or mailchimp when the client chooses a provider."
      : esp.configured
        ? `${esp.providerLabel} connected — new signups sync automatically.`
        : `Missing: ${esp.missing.join(", ")}`;

  return (
    <section className={adminPageSectionClass}>
      <AdminPageHeader
        title="Newsletter"
        description="Marketing email signups with GDPR double opt-in. Confirmed subscribers can sync to Klaviyo or Mailchimp."
        source={source}
        count={totalCount}
        countLabel="subscribers"
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-lg bg-surface-container-low px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
            {pendingConfirmationCount} awaiting confirm
          </div>
          <div className="rounded-lg bg-surface-container-low px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
            {pendingEspSyncCount} pending ESP sync
          </div>
          <div className="rounded-lg bg-surface-container-low px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-primary">
            ESP: {esp.providerLabel}
          </div>
          {canSync ? (
            <button
              type="button"
              onClick={() => void handleSync()}
              disabled={syncing}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-on-primary transition-opacity disabled:opacity-50"
            >
              {syncing ? "Syncing…" : `Sync pending to ${esp.providerLabel}`}
            </button>
          ) : null}
        </div>
      </AdminPageHeader>

      <p className="text-sm text-on-surface-variant">{espHint}</p>
      {actionError ? <p className="text-sm text-error">{actionError}</p> : null}
      {syncMessage ? <p className="text-sm text-primary">{syncMessage}</p> : null}

      <article className="overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest shadow-[0_30px_50px_-12px_rgba(18,18,18,0.03)]">
        <div className={adminCardToolbarClass}>
          <div className="relative w-full sm:max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              search
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search email or locale..."
              className="w-full rounded-lg border-none bg-surface-container-low py-2 pl-10 pr-4 text-sm transition-all focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <select
              value={sourceFilter}
              onChange={(event) =>
                setSourceFilter(event.target.value as typeof sourceFilter)
              }
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-primary sm:w-auto"
            >
              <option value="all">All sources</option>
              <option value="homepage">Homepage</option>
              <option value="cart">Cart footer</option>
              <option value="cart-empty">Empty cart</option>
            </select>
            <select
              value={espFilter}
              onChange={(event) => setEspFilter(event.target.value as typeof espFilter)}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-primary sm:w-auto"
            >
              <option value="all">All status</option>
              <option value="awaiting">Awaiting confirm</option>
              <option value="pending">Pending ESP</option>
              <option value="synced">Synced</option>
            </select>
          </div>
        </div>

        <ul className="divide-y divide-outline-variant/20 md:hidden">
          {filtered.length === 0 ? (
            <li className="px-4 py-10 text-center text-sm text-on-surface-variant">{emptyMessage}</li>
          ) : (
            filtered.map((row) => (
              <li key={row.id} className="px-4 py-4">
                <p className="truncate text-sm font-medium text-primary">{row.email}</p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  {row.sourceLabel} · {row.locale.toUpperCase()}
                </p>
                <p className="mt-1 text-xs text-on-surface-variant">{row.createdAtLabel}</p>
                <span
                  className={`mt-2 inline-block rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${
                    !row.confirmed
                      ? "bg-amber-100 text-amber-900"
                      : row.syncedToEsp
                        ? "bg-surface-container-high text-on-surface-variant"
                        : "bg-primary/10 text-primary"
                  }`}
                >
                  {row.confirmed ? row.espLabel : row.confirmationLabel}
                </span>
              </li>
            ))
          )}
        </ul>

        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-[760px] w-full text-left">
            <thead className="bg-surface-container-high">
              <tr>
                {["Email", "Locale", "Source", "Status", "Consented", "Joined"].map((heading) => (
                  <th key={heading} className={adminTableHeadCellClass}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className={`${adminTableBodyCellClass} py-10 text-center text-on-surface-variant`}
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id}>
                    <td className={`${adminTableBodyCellClass} font-medium text-primary`}>
                      {row.email}
                    </td>
                    <td className={`${adminTableBodyCellClass} uppercase`}>{row.locale}</td>
                    <td className={`${adminTableBodyCellClass} text-on-surface-variant`}>
                      {row.sourceLabel}
                    </td>
                    <td className={adminTableBodyCellClass}>
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${
                          !row.confirmed
                            ? "bg-amber-100 text-amber-900"
                            : row.syncedToEsp
                              ? "bg-surface-container-high text-on-surface-variant"
                              : "bg-primary/10 text-primary"
                        }`}
                      >
                        {row.confirmed ? row.espLabel : row.confirmationLabel}
                      </span>
                    </td>
                    <td className={`${adminTableBodyCellClass} text-on-surface-variant`}>
                      {row.consentedAtLabel}
                    </td>
                    <td className={`${adminTableBodyCellClass} text-on-surface-variant`}>
                      {row.createdAtLabel}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
