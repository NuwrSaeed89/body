"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type {
  AdminShippingRateRow,
  ShippingCarrier,
  ShippingRateDetail,
  ShippingService,
} from "@/lib/admin/shipping/types";
import { adminCardToolbarClass } from "./admin-layout-styles";
import { AdminConfirmDialog } from "./admin-confirm-dialog";
import { AdminPageHeader } from "./admin-page-header";
import { AdminShippingRateFormModal } from "./admin-shipping-rate-form-modal";
import {
  AdminShippingRatesTable,
  AdminShippingStatusBadge,
} from "./admin-shipping-rates-table";

type AdminShippingRatesClientProps = {
  rates: AdminShippingRateRow[];
  source: "supabase" | "mock";
  canMutate: boolean;
  loadError?: string | null;
};

function rowToDetail(rate: AdminShippingRateRow): ShippingRateDetail {
  return {
    id: rate.id,
    carrier: rate.carrier,
    service: rate.service,
    zoneCode: rate.zoneCode,
    zoneLabel: rate.zoneLabel,
    countries: rate.countries,
    priceUsd: rate.priceUsd,
    etaMinDays: rate.etaMinDays,
    etaMaxDays: rate.etaMaxDays,
    isActive: rate.isActive,
    sortOrder: rate.sortOrder,
  };
}

export function AdminShippingRatesClient({
  rates,
  source,
  canMutate,
  loadError = null,
}: AdminShippingRatesClientProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingRate, setEditingRate] = useState<ShippingRateDetail | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteRate, setConfirmDeleteRate] = useState<AdminShippingRateRow | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [carrierFilter, setCarrierFilter] = useState<"all" | ShippingCarrier>("all");
  const [serviceFilter, setServiceFilter] = useState<"all" | ShippingService>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const filteredRates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return rates.filter((rate) => {
      const matchesQuery =
        !query ||
        rate.zoneCode.toLowerCase().includes(query) ||
        rate.zoneLabel.toLowerCase().includes(query) ||
        rate.countriesLabel.toLowerCase().includes(query) ||
        rate.carrierLabel.toLowerCase().includes(query);
      const matchesCarrier = carrierFilter === "all" || rate.carrier === carrierFilter;
      const matchesService = serviceFilter === "all" || rate.service === serviceFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && rate.isActive) ||
        (statusFilter === "inactive" && !rate.isActive);
      return matchesQuery && matchesCarrier && matchesService && matchesStatus;
    });
  }, [rates, searchQuery, carrierFilter, serviceFilter, statusFilter]);

  const emptyMessage = loadError
    ? "Shipping rates could not be loaded."
    : rates.length === 0
      ? "No shipping rates yet. Add PostNord / DHL zones for Europe."
      : "No shipping rates match your filters.";

  const openCreate = () => {
    setFormMode("create");
    setEditingRate(null);
    setFormOpen(true);
    setActionError(null);
  };

  const openEdit = (rate: AdminShippingRateRow) => {
    setFormMode("edit");
    setEditingRate(rowToDetail(rate));
    setFormOpen(true);
    setActionError(null);
  };

  const handleDelete = async (rate: AdminShippingRateRow) => {
    setDeletingId(rate.id);
    setActionError(null);

    try {
      const response = await fetch(`/api/admin/shipping/${rate.id}`, { method: "DELETE" });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        setActionError(body.error ?? "Delete failed");
        return;
      }
      router.refresh();
    } catch {
      setActionError("Network error — could not delete shipping rate");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Shipping Rates"
        description="PostNord and DHL zones for Europe — price (USD), ETA, and country coverage."
        source={source}
        count={rates.length}
        countLabel="rates"
      >
        {canMutate ? (
          <button
            type="button"
            onClick={openCreate}
            className="flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-on-primary transition-opacity hover:opacity-90 sm:w-auto"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Rate
          </button>
        ) : null}
      </AdminPageHeader>

      {loadError && (
        <p className="mb-4 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          {loadError}
        </p>
      )}

      {!canMutate && !loadError && source === "mock" && (
        <p className="mb-4 rounded-lg border border-outline-variant bg-surface-container-high px-4 py-3 text-sm text-on-surface-variant">
          Enable live Supabase to create, edit, or delete shipping rates.
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
              placeholder="Search zone, country, carrier..."
              className="w-full rounded-lg border-none bg-surface-container-low py-2 pl-10 pr-4 text-sm transition-all focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <select
              value={carrierFilter}
              onChange={(event) =>
                setCarrierFilter(event.target.value as typeof carrierFilter)
              }
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-primary sm:w-auto"
            >
              <option value="all">All carriers</option>
              <option value="postnord">PostNord</option>
              <option value="dhl">DHL</option>
            </select>
            <select
              value={serviceFilter}
              onChange={(event) =>
                setServiceFilter(event.target.value as typeof serviceFilter)
              }
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-primary sm:w-auto"
            >
              <option value="all">All services</option>
              <option value="standard">Standard</option>
              <option value="express">Express</option>
            </select>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as typeof statusFilter)
              }
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-primary sm:w-auto"
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <ul className="divide-y divide-outline-variant/20 md:hidden">
          {filteredRates.length === 0 ? (
            <li className="px-4 py-10 text-center text-sm text-on-surface-variant">
              {emptyMessage}
            </li>
          ) : (
            filteredRates.map((rate) => (
              <li
                key={rate.id}
                className={`px-4 py-4 ${canMutate ? "cursor-pointer active:bg-surface-container-low/50" : ""}`}
                onClick={() => canMutate && openEdit(rate)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-primary">
                      {rate.carrierLabel} · {rate.serviceLabel}
                    </p>
                    <p className="mt-1 text-xs text-on-surface-variant">
                      {rate.zoneLabel}{" "}
                      <span className="font-mono uppercase">({rate.zoneCode})</span>
                    </p>
                    <p className="mt-1 font-mono text-xs uppercase text-on-surface-variant">
                      {rate.countriesLabel}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-primary">{rate.priceLabel}</span>
                      <span className="text-xs text-on-surface-variant">{rate.etaLabel}</span>
                      <AdminShippingStatusBadge active={rate.isActive} />
                    </div>
                  </div>
                  {canMutate && (
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          openEdit(rate);
                        }}
                        className="material-symbols-outlined rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                        aria-label={`Edit ${rate.zoneLabel}`}
                      >
                        edit
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setConfirmDeleteRate(rate);
                        }}
                        disabled={deletingId === rate.id}
                        className="material-symbols-outlined rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-error disabled:opacity-50"
                        aria-label={`Delete ${rate.zoneLabel}`}
                      >
                        {deletingId === rate.id ? "hourglass_empty" : "delete"}
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>

        <div className="hidden md:block">
          <AdminShippingRatesTable
            rates={filteredRates}
            emptyMessage={emptyMessage}
            canMutate={canMutate}
            deletingId={deletingId}
            onEdit={openEdit}
            onDelete={(rate) => setConfirmDeleteRate(rate)}
          />
        </div>
      </article>

      <AdminShippingRateFormModal
        open={formOpen}
        mode={formMode}
        initial={editingRate}
        canMutate={canMutate}
        onClose={() => setFormOpen(false)}
        onSaved={() => router.refresh()}
      />

      <AdminConfirmDialog
        open={Boolean(confirmDeleteRate)}
        title="Delete shipping rate?"
        description={
          confirmDeleteRate
            ? `Delete ${confirmDeleteRate.carrierLabel} ${confirmDeleteRate.serviceLabel} for ${confirmDeleteRate.zoneLabel}?`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        tone="danger"
        busy={Boolean(confirmDeleteRate && deletingId === confirmDeleteRate.id)}
        onCancel={() => setConfirmDeleteRate(null)}
        onConfirm={() => {
          const target = confirmDeleteRate;
          setConfirmDeleteRate(null);
          if (target) void handleDelete(target);
        }}
      />
    </>
  );
}
