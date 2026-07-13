"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { CURRENCIES, DEFAULT_PRODUCT_CURRENCY, type Currency } from "@/lib/currency";
import type { DiscountDetail, DiscountType } from "@/lib/admin/discounts/types";
import {
  adminCheckboxClassName,
  adminFieldClassName,
  adminLabelClassName,
} from "./admin-form-styles";

export type DiscountFormValues = {
  code: string;
  description: string;
  type: DiscountType;
  percentOff: string;
  amountOff: string;
  currency: Currency;
  maxUses: string;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
};

type AdminDiscountFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  initial?: DiscountDetail | null;
  onClose: () => void;
  onSaved: () => void;
};

const EMPTY_FORM: DiscountFormValues = {
  code: "",
  description: "",
  type: "percent",
  percentOff: "10",
  amountOff: "",
  currency: DEFAULT_PRODUCT_CURRENCY,
  maxUses: "",
  startsAt: "",
  expiresAt: "",
  isActive: true,
};

function toDisplayDate(value: string | null | undefined): string {
  if (!value) return "";
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(value)) return value;
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    const [year, month, day] = value.slice(0, 10).split("-");
    return `${year}/${month}/${day}`;
  }
  return value;
}

function toIsoDate(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  if (!match) return trimmed;
  const [, year, month, day] = match;
  return `${year}-${month}-${day}`;
}

function toFormValues(discount?: DiscountDetail | null): DiscountFormValues {
  if (!discount) return EMPTY_FORM;
  return {
    code: discount.code,
    description: discount.description ?? "",
    type: discount.type,
    percentOff: discount.percentOff != null ? String(discount.percentOff) : "",
    amountOff: discount.amountOff != null ? String(discount.amountOff) : "",
    currency: discount.currency ?? DEFAULT_PRODUCT_CURRENCY,
    maxUses: discount.maxUses != null ? String(discount.maxUses) : "",
    startsAt: toDisplayDate(discount.startsAt),
    expiresAt: toDisplayDate(discount.expiresAt),
    isActive: discount.isActive,
  };
}

export function AdminDiscountFormModal({
  open,
  mode,
  initial,
  onClose,
  onSaved,
}: AdminDiscountFormModalProps) {
  const [form, setForm] = useState<DiscountFormValues>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const startsAtPickerRef = useRef<HTMLInputElement>(null);
  const expiresAtPickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setForm(toFormValues(initial));
    setError(null);
    requestAnimationFrame(() => setVisible(true));
  }, [open, initial, mode]);

  useEffect(() => {
    if (open) return;
    setVisible(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const updateField = <K extends keyof DiscountFormValues>(key: K, value: DiscountFormValues[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const openDatePicker = (ref: RefObject<HTMLInputElement | null>) => {
    const picker = ref.current as (HTMLInputElement & { showPicker?: () => void }) | null;
    if (!picker) return;
    if (picker.showPicker) {
      picker.showPicker();
      return;
    }
    picker.click();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      code: form.code,
      description: form.description || null,
      type: form.type,
      percentOff: form.type === "percent" ? Number(form.percentOff) : null,
      amountOff: form.type === "fixed" ? Number(form.amountOff) : null,
      currency: form.type === "fixed" ? form.currency : null,
      maxUses: form.maxUses.trim() ? Number(form.maxUses) : null,
      startsAt: form.startsAt || null,
      expiresAt: form.expiresAt || null,
      isActive: form.isActive,
    };

    const url = mode === "create" ? "/api/admin/discounts" : `/api/admin/discounts/${initial?.id}`;
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
      setError("Network error — could not save discount code");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60]" role="presentation">
      <button
        type="button"
        aria-label="Close discount drawer"
        onClick={onClose}
        className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="discount-form-title"
        className={`absolute right-0 top-0 flex h-[100dvh] w-full max-w-xl flex-col border-l border-outline-variant bg-surface-bright shadow-2xl transition-transform duration-300 ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-outline-variant p-4 sm:p-6 md:p-8">
          <h3 id="discount-form-title" className="text-lg font-semibold text-primary">
            {mode === "create" ? "Add Discount Code" : "Edit Discount Code"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="material-symbols-outlined rounded-full p-2 transition-colors hover:bg-surface-container"
            aria-label="Close"
          >
            close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-grow space-y-6 overflow-y-auto p-4 sm:space-y-8 sm:p-6 md:p-8">
            {error && (
              <p className="rounded-lg border border-outline-variant bg-surface-container-high px-4 py-3 text-sm text-primary">
                {error}
              </p>
            )}

            <div>
              <label className={adminLabelClassName} htmlFor="discount-code">
                Code
              </label>
              <input
                id="discount-code"
                required
                value={form.code}
                onChange={(event) => updateField("code", event.target.value.toUpperCase())}
                className={`${adminFieldClassName} font-mono uppercase`}
                placeholder="WELCOME10"
              />
            </div>

            <div>
              <label className={adminLabelClassName} htmlFor="discount-description">
                Description
              </label>
              <textarea
                id="discount-description"
                rows={3}
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
                className={adminFieldClassName}
                placeholder="Optional internal note"
              />
            </div>

            <div>
              <p className={adminLabelClassName}>Discount type</p>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    ["percent", "Percentage"],
                    ["fixed", "Fixed amount"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => updateField("type", value)}
                    className={`rounded-lg border px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] transition-colors ${
                      form.type === value
                        ? "border-primary bg-primary text-on-primary"
                        : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {form.type === "percent" ? (
              <div>
                <label className={adminLabelClassName} htmlFor="discount-percent">
                  Percent off
                </label>
                <input
                  id="discount-percent"
                  type="number"
                  min={0.01}
                  max={100}
                  step="0.01"
                  required
                  value={form.percentOff}
                  onChange={(event) => updateField("percentOff", event.target.value)}
                  className={adminFieldClassName}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={adminLabelClassName} htmlFor="discount-amount">
                    Amount off
                  </label>
                  <input
                    id="discount-amount"
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    value={form.amountOff}
                    onChange={(event) => updateField("amountOff", event.target.value)}
                    className={adminFieldClassName}
                  />
                </div>
                <div>
                  <label className={adminLabelClassName} htmlFor="discount-currency">
                    Currency
                  </label>
                  <select
                    id="discount-currency"
                    value={form.currency}
                    onChange={(event) => updateField("currency", event.target.value as Currency)}
                    className={adminFieldClassName}
                  >
                    {CURRENCIES.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className={adminLabelClassName} htmlFor="discount-max-uses">
                Usage limit
              </label>
              <input
                id="discount-max-uses"
                type="number"
                min={1}
                step={1}
                value={form.maxUses}
                onChange={(event) => updateField("maxUses", event.target.value)}
                className={adminFieldClassName}
                placeholder="Unlimited"
              />
              <p className="mt-2 text-xs text-on-surface-variant">
                Leave empty for unlimited uses. Current redemptions stay tracked separately.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={adminLabelClassName} htmlFor="discount-starts-at">
                  Starts at
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="discount-starts-at"
                    type="text"
                    inputMode="numeric"
                    placeholder="yyyy/mm/dd"
                    maxLength={10}
                    dir="ltr"
                    value={form.startsAt}
                    onChange={(event) => updateField("startsAt", event.target.value)}
                    className={`${adminFieldClassName} text-left [direction:ltr]`}
                  />
                  <button
                    type="button"
                    onClick={() => openDatePicker(startsAtPickerRef)}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container"
                    aria-label="Pick start date"
                  >
                    <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                  </button>
                  <input
                    ref={startsAtPickerRef}
                    type="date"
                    tabIndex={-1}
                    value={toIsoDate(form.startsAt) ?? ""}
                    onChange={(event) => updateField("startsAt", toDisplayDate(event.target.value))}
                    className="pointer-events-none absolute h-0 w-0 opacity-0"
                    aria-hidden
                  />
                </div>
              </div>
              <div>
                <label className={adminLabelClassName} htmlFor="discount-expires-at">
                  Expires at
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="discount-expires-at"
                    type="text"
                    inputMode="numeric"
                    placeholder="yyyy/mm/dd"
                    maxLength={10}
                    dir="ltr"
                    value={form.expiresAt}
                    onChange={(event) => updateField("expiresAt", event.target.value)}
                    className={`${adminFieldClassName} text-left [direction:ltr]`}
                  />
                  <button
                    type="button"
                    onClick={() => openDatePicker(expiresAtPickerRef)}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container"
                    aria-label="Pick expiry date"
                  >
                    <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                  </button>
                  <input
                    ref={expiresAtPickerRef}
                    type="date"
                    tabIndex={-1}
                    value={toIsoDate(form.expiresAt) ?? ""}
                    onChange={(event) => updateField("expiresAt", toDisplayDate(event.target.value))}
                    className="pointer-events-none absolute h-0 w-0 opacity-0"
                    aria-hidden
                  />
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => updateField("isActive", event.target.checked)}
                className={adminCheckboxClassName}
              />
              Active
            </label>

            {mode === "edit" && initial && (
              <p className="rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-xs text-on-surface-variant">
                Used {initial.usedCount}
                {initial.maxUses != null ? ` / ${initial.maxUses}` : " times (unlimited)"}
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-outline-variant p-4 sm:flex-row sm:gap-4 sm:p-6 md:p-8">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-primary py-3 text-xs font-semibold uppercase tracking-[0.1em] text-on-primary transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? "Saving…" : mode === "create" ? "Create Code" : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 rounded-lg border border-outline-variant py-3 text-xs font-semibold uppercase tracking-[0.1em] transition-colors hover:bg-surface-container disabled:opacity-60"
            >
              Discard
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
