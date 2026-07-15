"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type {
  AdminWaitingListRow,
  WaitingNotifyStatus,
} from "@/lib/admin/waiting-list/types";
import { Link } from "@/i18n/navigation";
import {
  adminCardToolbarClass,
  adminTableBodyCellClass,
  adminTableHeadCellClass,
} from "./admin-layout-styles";
import { AdminConfirmDialog } from "./admin-confirm-dialog";
import { AdminPageHeader } from "./admin-page-header";
import { AdminWaitingStatusBadge } from "./admin-waiting-status-badge";

type AdminWaitingListClientProps = {
  rows: AdminWaitingListRow[];
  source: "supabase" | "mock";
  totalCount: number;
  waitingCount: number;
  notifiedCount: number;
  canMutate: boolean;
  initialProductFilter?: string;
};

export function AdminWaitingListClient({
  rows,
  source,
  totalCount,
  waitingCount,
  notifiedCount,
  canMutate,
  initialProductFilter = "",
}: AdminWaitingListClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialProductFilter);
  const [statusFilter, setStatusFilter] = useState<"all" | WaitingNotifyStatus>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminWaitingListRow | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesQuery =
        !query ||
        row.email.toLowerCase().includes(query) ||
        row.productName.toLowerCase().includes(query) ||
        row.productSlug.toLowerCase().includes(query) ||
        row.variantLabel.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || row.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [rows, searchQuery, statusFilter]);

  const emptyMessage =
    rows.length === 0
      ? "No waiting-list subscriptions yet. Customers who tap Notify me when back will appear here."
      : "No subscriptions match your filters.";

  const handleDelete = async (row: AdminWaitingListRow) => {
    setDeletingId(row.id);
    setActionError(null);

    try {
      const response = await fetch(`/api/admin/waiting-list/${row.id}`, { method: "DELETE" });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        setActionError(body.error ?? "Delete failed");
        return;
      }
      router.refresh();
    } catch {
      setActionError("Network error — could not remove subscription");
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Waiting List"
        description="Customers waiting for restock alerts — email, product, and variant."
        source={source}
        count={totalCount}
        countLabel="subscribers"
      >
        <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
          <span className="rounded-lg bg-surface-container-low px-3 py-2 text-primary">
            {waitingCount} waiting
          </span>
          <span className="rounded-lg bg-surface-container-low px-3 py-2">
            {notifiedCount} notified
          </span>
        </div>
      </AdminPageHeader>

      {!canMutate && (
        <p className="mb-4 text-sm text-on-surface-variant">
          Enable live Supabase to remove waiting-list subscriptions.
        </p>
      )}

      {actionError && (
        <p className="mb-4 rounded-lg border border-outline-variant bg-surface-container-high px-4 py-3 text-sm text-primary">
          {actionError}
        </p>
      )}

      <article className="mb-6 overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest shadow-[0_30px_50px_-12px_rgba(18,18,18,0.03)] sm:mb-8">
        <div className={adminCardToolbarClass}>
          <div className="relative w-full sm:max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              search
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search email, product, variant..."
              className="w-full rounded-lg border-none bg-surface-container-low py-2 pl-10 pr-4 text-sm transition-all focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
            className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-primary sm:w-auto"
          >
            <option value="all">All status</option>
            <option value="waiting">Waiting</option>
            <option value="notified">Notified</option>
          </select>
        </div>

        <ul className="divide-y divide-outline-variant/20 md:hidden">
          {filteredRows.length === 0 ? (
            <li className="px-4 py-10 text-center text-sm text-on-surface-variant">{emptyMessage}</li>
          ) : (
            filteredRows.map((row) => (
              <li key={row.id} className="px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-primary">{row.email}</p>
                    <p className="mt-1 truncate text-xs text-on-surface-variant">{row.productName}</p>
                    <p className="mt-1 text-xs text-on-surface-variant">{row.variantLabel}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <AdminWaitingStatusBadge status={row.status} />
                      <span className="text-xs text-on-surface-variant">{row.createdAtLabel}</span>
                    </div>
                  </div>
                  {canMutate && (
                    <button
                      type="button"
                      disabled={deletingId === row.id}
                      onClick={() => setConfirmDelete(row)}
                      className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>

        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-[880px] w-full text-left">
            <thead className="bg-surface-container-high">
              <tr>
                {["Email", "Product", "Variant", "Status", "Subscribed", "Actions"].map(
                  (heading) => (
                    <th key={heading} className={adminTableHeadCellClass}>
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className={`${adminTableBodyCellClass} py-10 text-center text-on-surface-variant`}
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.id}>
                    <td className={`${adminTableBodyCellClass} font-medium text-primary`}>
                      {row.email}
                    </td>
                    <td className={adminTableBodyCellClass}>
                      <p className="font-medium text-primary">{row.productName}</p>
                      <Link
                        href={`/shop/${row.productSlug}`}
                        className="mt-0.5 block text-xs text-on-surface-variant underline-offset-2 hover:underline"
                      >
                        {row.productSlug}
                      </Link>
                    </td>
                    <td className={`${adminTableBodyCellClass} text-on-surface-variant`}>
                      {row.variantLabel}
                    </td>
                    <td className={adminTableBodyCellClass}>
                      <AdminWaitingStatusBadge status={row.status} />
                    </td>
                    <td className={`${adminTableBodyCellClass} text-on-surface-variant`}>
                      {row.createdAtLabel}
                    </td>
                    <td className={adminTableBodyCellClass}>
                      {canMutate ? (
                        <button
                          type="button"
                          disabled={deletingId === row.id}
                          onClick={() => setConfirmDelete(row)}
                          className="rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary disabled:opacity-50"
                        >
                          Remove
                        </button>
                      ) : (
                        <span className="text-xs text-on-surface-variant">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </article>

      <AdminConfirmDialog
        open={Boolean(confirmDelete)}
        title="Remove subscription?"
        description={
          confirmDelete
            ? `Remove ${confirmDelete.email} from the waiting list for ${confirmDelete.productName}?`
            : ""
        }
        confirmLabel="Remove"
        busy={Boolean(deletingId)}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete) void handleDelete(confirmDelete);
        }}
      />
    </>
  );
}
