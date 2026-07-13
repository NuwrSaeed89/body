"use client";

import { useEffect, useState } from "react";
import type { AdminOrderDetail } from "@/lib/admin/list-types";
import type { ShippingCarrier, ShippingService } from "@/lib/admin/shipping/types";
import { Link } from "@/i18n/navigation";
import { adminCheckboxClassName, adminFieldClassName, adminLabelClassName } from "./admin-form-styles";

type AdminOrderShippingPanelProps = {
  order: AdminOrderDetail;
  locale: string;
  canMutate: boolean;
  onOrderUpdated: (order: AdminOrderDetail) => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
};

export function AdminOrderShippingPanel({
  order,
  locale,
  canMutate,
  onOrderUpdated,
  onError,
  onSuccess,
}: AdminOrderShippingPanelProps) {
  const shipping = order.shipping;
  const [carrier, setCarrier] = useState<ShippingCarrier>(shipping.carrier ?? "postnord");
  const [service, setService] = useState<ShippingService>(shipping.service ?? "standard");
  const [trackingNumber, setTrackingNumber] = useState(shipping.trackingNumber ?? "");
  const [trackingUrl, setTrackingUrl] = useState(shipping.trackingUrl ?? "");
  const [notes, setNotes] = useState(shipping.notes ?? "");
  const [markShipped, setMarkShipped] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    setCarrier(shipping.carrier ?? "postnord");
    setService(shipping.service ?? "standard");
    setTrackingNumber(shipping.trackingNumber ?? "");
    setTrackingUrl(shipping.trackingUrl ?? "");
    setNotes(shipping.notes ?? "");
  }, [shipping]);

  const handleSaveManual = async () => {
    if (!canMutate) return;
    setSaving(true);
    try {
      const response = await fetch(
        `/api/admin/orders/${order.id}/shipping?locale=${locale}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            carrier,
            service,
            trackingNumber,
            trackingUrl: trackingUrl.trim() || null,
            notes: notes.trim() || null,
            labelStatus: "manual",
            markShipped,
          }),
        },
      );
      const payload = (await response.json()) as { order?: AdminOrderDetail; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Could not save tracking");
      if (payload.order) onOrderUpdated(payload.order);
      onSuccess("Tracking saved.");
    } catch (error) {
      onError(error instanceof Error ? error.message : "Could not save tracking");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateLabel = async () => {
    if (!canMutate) return;
    setGenerating(true);
    try {
      const response = await fetch(
        `/api/admin/orders/${order.id}/shipping/label?locale=${locale}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ carrier, service, markShipped }),
        },
      );
      const payload = (await response.json()) as {
        order?: AdminOrderDetail;
        mode?: string;
        error?: string;
      };
      if (!response.ok) throw new Error(payload.error ?? "Could not generate label");
      if (payload.order) onOrderUpdated(payload.order);
      onSuccess(
        payload.mode === "live"
          ? "Shipping label generated (carrier credentials configured)."
          : "Shipping label generated (simulated — add PostNord/DHL API keys for live booking).",
      );
    } catch (error) {
      onError(error instanceof Error ? error.message : "Could not generate label");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <article className="rounded-xl border border-outline-variant bg-surface-container-low p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
          Shipping & tracking
        </h3>
        <span className="rounded-full bg-surface-container-high px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-primary">
          {shipping.labelStatusLabel}
        </span>
      </div>

      {shipping.trackingNumber ? (
        <div className="mt-3 space-y-1 text-sm">
          <p className="font-semibold text-primary">
            {[shipping.carrierLabel, shipping.serviceLabel].filter(Boolean).join(" · ")}
          </p>
          <p className="font-mono text-xs text-on-surface-variant">{shipping.trackingNumber}</p>
          {shipping.shippedAt ? (
            <p className="text-xs text-on-surface-variant">Shipped {shipping.shippedAt}</p>
          ) : null}
          <div className="flex flex-wrap gap-3 pt-1">
            {shipping.trackingUrl ? (
              <a
                href={shipping.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold uppercase tracking-[0.08em] text-primary underline underline-offset-2"
              >
                Track shipment
              </a>
            ) : null}
            {shipping.labelUrl ? (
              shipping.labelUrl.startsWith("/admin/") ? (
                <Link
                  href={`/admin/orders/${order.id}/label`}
                  className="text-xs font-semibold uppercase tracking-[0.08em] text-primary underline underline-offset-2"
                >
                  Print label
                </Link>
              ) : (
                <a
                  href={shipping.labelUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold uppercase tracking-[0.08em] text-primary underline underline-offset-2"
                >
                  Open label
                </a>
              )
            ) : shipping.labelStatus === "generated" || shipping.trackingNumber ? (
              <Link
                href={`/admin/orders/${order.id}/label`}
                className="text-xs font-semibold uppercase tracking-[0.08em] text-primary underline underline-offset-2"
              >
                Print label
              </Link>
            ) : null}
          </div>
        </div>
      ) : (
        <p className="mt-3 text-xs leading-relaxed text-on-surface-variant">
          Enter tracking manually or generate a PostNord / DHL label for this order.
        </p>
      )}

      {canMutate ? (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={adminLabelClassName} htmlFor="ship-carrier">
                Carrier
              </label>
              <select
                id="ship-carrier"
                value={carrier}
                onChange={(event) => setCarrier(event.target.value as ShippingCarrier)}
                className={adminFieldClassName}
              >
                <option value="postnord">PostNord</option>
                <option value="dhl">DHL</option>
              </select>
            </div>
            <div>
              <label className={adminLabelClassName} htmlFor="ship-service">
                Service
              </label>
              <select
                id="ship-service"
                value={service}
                onChange={(event) => setService(event.target.value as ShippingService)}
                className={adminFieldClassName}
              >
                <option value="standard">Standard</option>
                <option value="express">Express</option>
              </select>
            </div>
          </div>

          <div>
            <label className={adminLabelClassName} htmlFor="ship-tracking">
              Tracking number
            </label>
            <input
              id="ship-tracking"
              value={trackingNumber}
              onChange={(event) => setTrackingNumber(event.target.value)}
              className={`${adminFieldClassName} font-mono`}
              placeholder="Manual or generated"
            />
          </div>

          <div>
            <label className={adminLabelClassName} htmlFor="ship-tracking-url">
              Tracking URL (optional)
            </label>
            <input
              id="ship-tracking-url"
              value={trackingUrl}
              onChange={(event) => setTrackingUrl(event.target.value)}
              className={adminFieldClassName}
              placeholder="Auto-filled per carrier if empty"
            />
          </div>

          <div>
            <label className={adminLabelClassName} htmlFor="ship-notes">
              Notes
            </label>
            <input
              id="ship-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className={adminFieldClassName}
              placeholder="Warehouse note, pickup point…"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-on-surface">
            <input
              type="checkbox"
              checked={markShipped}
              onChange={(event) => setMarkShipped(event.target.checked)}
              className={adminCheckboxClassName}
            />
            Mark order as shipped when saving
          </label>

          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              disabled={saving || generating || trackingNumber.trim().length < 4}
              onClick={() => void handleSaveManual()}
              className="rounded-lg border border-outline-variant px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-primary hover:bg-surface-container disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save tracking"}
            </button>
            <button
              type="button"
              disabled={saving || generating}
              onClick={() => void handleGenerateLabel()}
              className="rounded-lg bg-primary px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-on-primary disabled:opacity-50"
            >
              {generating ? "Generating…" : "Generate label"}
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-xs text-on-surface-variant">
          Tracking updates require live Supabase.
        </p>
      )}
    </article>
  );
}
