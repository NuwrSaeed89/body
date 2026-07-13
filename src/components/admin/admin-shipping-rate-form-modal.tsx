"use client";

import { useEffect, useState, type FormEvent } from "react";
import type {
  ShippingCarrier,
  ShippingRateDetail,
  ShippingService,
} from "@/lib/admin/shipping/types";
import {
  adminCheckboxClassName,
  adminFieldClassName,
  adminLabelClassName,
} from "./admin-form-styles";
import { AdminConfirmDialog } from "./admin-confirm-dialog";

type ShippingRateFormValues = {
  carrier: ShippingCarrier;
  service: ShippingService;
  zoneCode: string;
  zoneLabel: string;
  countries: string;
  priceSek: string;
  etaMinDays: string;
  etaMaxDays: string;
  sortOrder: string;
  isActive: boolean;
};

type AdminShippingRateFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  initial?: ShippingRateDetail | null;
  canMutate?: boolean;
  onClose: () => void;
  onSaved: () => void;
};

const EMPTY_FORM: ShippingRateFormValues = {
  carrier: "postnord",
  service: "standard",
  zoneCode: "",
  zoneLabel: "",
  countries: "",
  priceSek: "79",
  etaMinDays: "2",
  etaMaxDays: "5",
  sortOrder: "0",
  isActive: true,
};

function toFormValues(rate?: ShippingRateDetail | null): ShippingRateFormValues {
  if (!rate) return EMPTY_FORM;
  return {
    carrier: rate.carrier,
    service: rate.service,
    zoneCode: rate.zoneCode,
    zoneLabel: rate.zoneLabel,
    countries: rate.countries.join(", "),
    priceSek: String(rate.priceSek),
    etaMinDays: String(rate.etaMinDays),
    etaMaxDays: String(rate.etaMaxDays),
    sortOrder: String(rate.sortOrder),
    isActive: rate.isActive,
  };
}

export function AdminShippingRateFormModal({
  open,
  mode,
  initial,
  canMutate = true,
  onClose,
  onSaved,
}: AdminShippingRateFormModalProps) {
  const [form, setForm] = useState<ShippingRateFormValues>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(toFormValues(initial));
    setError(null);
    requestAnimationFrame(() => setVisible(true));
  }, [open, initial]);

  useEffect(() => {
    if (open) return;
    setVisible(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (submitting) setConfirmCloseOpen(true);
        else onClose();
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, submitting]);

  if (!open) return null;

  const updateField = <K extends keyof ShippingRateFormValues>(
    key: K,
    value: ShippingRateFormValues[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canMutate) return;
    setSubmitting(true);
    setError(null);

    const payload = {
      carrier: form.carrier,
      service: form.service,
      zoneCode: form.zoneCode,
      zoneLabel: form.zoneLabel,
      countries: form.countries,
      priceSek: Number(form.priceSek),
      etaMinDays: Number(form.etaMinDays),
      etaMaxDays: Number(form.etaMaxDays),
      sortOrder: Number(form.sortOrder),
      isActive: form.isActive,
    };

    const url =
      mode === "create" ? "/api/admin/shipping" : `/api/admin/shipping/${initial?.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(body.error ?? "Save failed");
        return;
      }
      onSaved();
      onClose();
    } catch {
      setError("Network error — could not save shipping rate");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60]" role="presentation">
      <button
        type="button"
        aria-label="Close shipping rate drawer"
        onClick={() => (submitting ? setConfirmCloseOpen(true) : onClose())}
        className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="shipping-rate-form-title"
        className={`absolute right-0 top-0 flex h-[100dvh] w-full max-w-lg flex-col border-l border-outline-variant bg-surface-bright shadow-2xl transition-transform duration-300 ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-outline-variant p-4 sm:p-6">
          <h3 id="shipping-rate-form-title" className="text-lg font-semibold text-primary">
            {mode === "create" ? "Add shipping rate" : "Edit shipping rate"}
          </h3>
          <button
            type="button"
            onClick={() => (submitting ? setConfirmCloseOpen(true) : onClose())}
            className="material-symbols-outlined rounded-full p-2 transition-colors hover:bg-surface-container"
            aria-label="Close"
          >
            close
          </button>
        </div>

        <form onSubmit={(event) => void handleSubmit(event)} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-grow space-y-5 overflow-y-auto p-4 sm:p-6">
            {error && (
              <p className="rounded-lg border border-outline-variant bg-surface-container-high px-4 py-3 text-sm text-primary">
                {error}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={adminLabelClassName} htmlFor="shipping-carrier">
                  Carrier
                </label>
                <select
                  id="shipping-carrier"
                  required
                  disabled={!canMutate}
                  value={form.carrier}
                  onChange={(event) =>
                    updateField("carrier", event.target.value as ShippingCarrier)
                  }
                  className={adminFieldClassName}
                >
                  <option value="postnord">PostNord</option>
                  <option value="dhl">DHL</option>
                </select>
              </div>
              <div>
                <label className={adminLabelClassName} htmlFor="shipping-service">
                  Service
                </label>
                <select
                  id="shipping-service"
                  required
                  disabled={!canMutate}
                  value={form.service}
                  onChange={(event) =>
                    updateField("service", event.target.value as ShippingService)
                  }
                  className={adminFieldClassName}
                >
                  <option value="standard">Standard</option>
                  <option value="express">Express</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={adminLabelClassName} htmlFor="shipping-zone-code">
                  Zone code
                </label>
                <input
                  id="shipping-zone-code"
                  required
                  disabled={!canMutate}
                  value={form.zoneCode}
                  onChange={(event) => updateField("zoneCode", event.target.value)}
                  placeholder="NORDICS"
                  className={`${adminFieldClassName} font-mono uppercase`}
                />
              </div>
              <div>
                <label className={adminLabelClassName} htmlFor="shipping-sort">
                  Sort order
                </label>
                <input
                  id="shipping-sort"
                  type="number"
                  disabled={!canMutate}
                  value={form.sortOrder}
                  onChange={(event) => updateField("sortOrder", event.target.value)}
                  className={adminFieldClassName}
                />
              </div>
            </div>

            <div>
              <label className={adminLabelClassName} htmlFor="shipping-zone-label">
                Zone label
              </label>
              <input
                id="shipping-zone-label"
                required
                disabled={!canMutate}
                value={form.zoneLabel}
                onChange={(event) => updateField("zoneLabel", event.target.value)}
                placeholder="Nordics"
                className={adminFieldClassName}
              />
            </div>

            <div>
              <label className={adminLabelClassName} htmlFor="shipping-countries">
                Countries (ISO)
              </label>
              <input
                id="shipping-countries"
                required
                disabled={!canMutate}
                value={form.countries}
                onChange={(event) => updateField("countries", event.target.value)}
                placeholder="SE, NO, DK, FI"
                className={`${adminFieldClassName} font-mono uppercase`}
              />
              <p className="mt-1 text-xs text-on-surface-variant">
                Comma-separated ISO-2 codes for Europe delivery countries.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={adminLabelClassName} htmlFor="shipping-price">
                  Price (SEK)
                </label>
                <input
                  id="shipping-price"
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  disabled={!canMutate}
                  value={form.priceSek}
                  onChange={(event) => updateField("priceSek", event.target.value)}
                  className={adminFieldClassName}
                />
              </div>
              <div>
                <label className={adminLabelClassName} htmlFor="shipping-eta-min">
                  ETA min
                </label>
                <input
                  id="shipping-eta-min"
                  type="number"
                  min={0}
                  required
                  disabled={!canMutate}
                  value={form.etaMinDays}
                  onChange={(event) => updateField("etaMinDays", event.target.value)}
                  className={adminFieldClassName}
                />
              </div>
              <div>
                <label className={adminLabelClassName} htmlFor="shipping-eta-max">
                  ETA max
                </label>
                <input
                  id="shipping-eta-max"
                  type="number"
                  min={0}
                  required
                  disabled={!canMutate}
                  value={form.etaMaxDays}
                  onChange={(event) => updateField("etaMaxDays", event.target.value)}
                  className={adminFieldClassName}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-on-surface">
              <input
                type="checkbox"
                disabled={!canMutate}
                checked={form.isActive}
                onChange={(event) => updateField("isActive", event.target.checked)}
                className={adminCheckboxClassName}
              />
              Active (available at checkout)
            </label>
          </div>

          <div className="flex shrink-0 gap-3 border-t border-outline-variant p-4 sm:p-6">
            <button
              type="button"
              onClick={() => (submitting ? setConfirmCloseOpen(true) : onClose())}
              className="flex-1 rounded-lg border border-outline-variant px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-on-surface-variant"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canMutate || submitting}
              className="flex-1 rounded-lg bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-on-primary disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Save rate"}
            </button>
          </div>
        </form>
      </aside>

      <AdminConfirmDialog
        open={confirmCloseOpen}
        title="Discard changes?"
        description="A save is in progress. Close anyway?"
        confirmLabel="Close"
        cancelLabel="Stay"
        tone="danger"
        onCancel={() => setConfirmCloseOpen(false)}
        onConfirm={() => {
          setConfirmCloseOpen(false);
          onClose();
        }}
      />
    </div>
  );
}
