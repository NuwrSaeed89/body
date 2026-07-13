"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { AdminDiscountRow, DiscountDetail } from "@/lib/admin/discounts/types";
import { adminCardToolbarClass } from "./admin-layout-styles";
import { AdminConfirmDialog } from "./admin-confirm-dialog";
import { AdminDiscountFormModal } from "./admin-discount-form-modal";
import {
  AdminDiscountStatusBadge,
  AdminDiscountsTable,
} from "./admin-discounts-table";

type AdminDiscountsClientProps = {
  discounts: AdminDiscountRow[];
  canMutate: boolean;
};

function rowToDiscountDetail(discount: AdminDiscountRow): DiscountDetail {
  return {
    id: discount.id,
    code: discount.code,
    description: discount.description,
    type: discount.type,
    percentOff: discount.percentOff,
    amountOff: discount.amountOff,
    currency: discount.currency,
    maxUses: discount.maxUses,
    usedCount: discount.usedCount,
    startsAt: discount.startsAt,
    expiresAt: discount.expiresAt,
    isActive: discount.isActive,
    createdAt: discount.createdAt,
  };
}

export function AdminDiscountsClient({ discounts, canMutate }: AdminDiscountsClientProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingDiscount, setEditingDiscount] = useState<DiscountDetail | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteDiscount, setConfirmDeleteDiscount] = useState<AdminDiscountRow | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "percent" | "fixed">("all");

  const filteredDiscounts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return discounts.filter((discount) => {
      const matchesQuery =
        !query ||
        discount.code.toLowerCase().includes(query) ||
        (discount.description ?? "").toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && discount.isActive) ||
        (statusFilter === "inactive" && !discount.isActive);
      const matchesType = typeFilter === "all" || discount.type === typeFilter;
      return matchesQuery && matchesStatus && matchesType;
    });
  }, [discounts, searchQuery, statusFilter, typeFilter]);

  const emptyMessage =
    discounts.length === 0
      ? "No discount codes yet. Create percentage or fixed-amount codes with expiry and usage limits."
      : "No discount codes match your filters.";

  const openCreate = () => {
    setFormMode("create");
    setEditingDiscount(null);
    setFormOpen(true);
    setActionError(null);
  };

  const openEdit = (discount: AdminDiscountRow) => {
    setFormMode("edit");
    setEditingDiscount(rowToDiscountDetail(discount));
    setFormOpen(true);
    setActionError(null);
  };

  const handleDelete = async (discount: AdminDiscountRow) => {
    setDeletingId(discount.id);
    setActionError(null);

    try {
      const response = await fetch(`/api/admin/discounts/${discount.id}`, { method: "DELETE" });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        setActionError(body.error ?? "Delete failed");
        return;
      }
      router.refresh();
    } catch {
      setActionError("Network error — could not delete discount code");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <section className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h2 className="mb-1 text-xl font-medium tracking-tight text-primary sm:text-2xl">
            Discount Codes
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-on-surface-variant sm:text-base">
            Create percentage or fixed discounts with expiry dates and usage limits.
          </p>
        </div>
        {canMutate ? (
          <button
            type="button"
            onClick={openCreate}
            className="flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-on-primary transition-opacity hover:opacity-90 sm:w-auto"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Discount Code
          </button>
        ) : (
          <p className="text-sm text-on-surface-variant">
            Enable live Supabase to create, edit, or delete discount codes.
          </p>
        )}
      </section>

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
              placeholder="Search by code or description..."
              className="w-full rounded-lg border-none bg-surface-container-low py-2 pl-10 pr-4 text-sm transition-all focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as typeof typeFilter)}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-primary sm:w-auto"
            >
              <option value="all">All types</option>
              <option value="percent">Percentage</option>
              <option value="fixed">Fixed</option>
            </select>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-primary sm:w-auto"
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <ul className="divide-y divide-outline-variant/20 md:hidden">
          {filteredDiscounts.length === 0 ? (
            <li className="px-4 py-10 text-center text-sm text-on-surface-variant">{emptyMessage}</li>
          ) : (
            filteredDiscounts.map((discount) => (
              <li
                key={discount.id}
                className={`px-4 py-4 ${canMutate ? "cursor-pointer active:bg-surface-container-low/50" : ""}`}
                onClick={() => canMutate && openEdit(discount)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-sm font-semibold uppercase text-primary">
                      {discount.code}
                    </p>
                    <p className="mt-1 text-xs text-on-surface-variant">
                      {discount.typeLabel} · {discount.valueLabel}
                    </p>
                    <p className="mt-1 text-xs text-on-surface-variant">
                      Usage {discount.usageLabel}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <AdminDiscountStatusBadge active={discount.isActive} />
                      <span className="text-xs text-on-surface-variant">
                        Exp {discount.expiresAtLabel}
                      </span>
                    </div>
                  </div>
                  {canMutate && (
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          openEdit(discount);
                        }}
                        className="material-symbols-outlined rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                        aria-label={`Edit ${discount.code}`}
                      >
                        edit
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setConfirmDeleteDiscount(discount);
                        }}
                        disabled={deletingId === discount.id}
                        className="material-symbols-outlined rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-error disabled:opacity-50"
                        aria-label={`Delete ${discount.code}`}
                      >
                        {deletingId === discount.id ? "hourglass_empty" : "delete"}
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>

        <div className="hidden md:block">
          <AdminDiscountsTable
            discounts={filteredDiscounts}
            emptyMessage={emptyMessage}
            canMutate={canMutate}
            deletingId={deletingId}
            onEdit={openEdit}
            onDelete={(discount) => setConfirmDeleteDiscount(discount)}
          />
        </div>
      </article>

      <AdminDiscountFormModal
        open={formOpen}
        mode={formMode}
        initial={editingDiscount}
        onClose={() => setFormOpen(false)}
        onSaved={() => router.refresh()}
      />

      <AdminConfirmDialog
        open={Boolean(confirmDeleteDiscount)}
        title="Delete discount code?"
        description={
          confirmDeleteDiscount
            ? `Delete "${confirmDeleteDiscount.code}"? Codes linked to existing orders cannot be removed.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        tone="danger"
        busy={Boolean(confirmDeleteDiscount && deletingId === confirmDeleteDiscount.id)}
        onCancel={() => setConfirmDeleteDiscount(null)}
        onConfirm={() => {
          const target = confirmDeleteDiscount;
          setConfirmDeleteDiscount(null);
          if (target) void handleDelete(target);
        }}
      />
    </>
  );
}
