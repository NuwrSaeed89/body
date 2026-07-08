"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import type { AdminOrderDetail } from "@/lib/admin/list-types";
import {
  ADMIN_FULFILLMENT_STATUSES,
  ADMIN_STATUS_UPDATABLE_FROM,
} from "@/lib/admin/orders/constants";
import { formatOrderStatusLabel } from "@/lib/admin/format";
import { orderStatusTone } from "@/lib/admin/orders/order-status-tone";
import { adminFieldClassName, adminLabelClassName } from "./admin-form-styles";
import {
  adminPageSectionClass,
  adminTableBodyCellClass,
  adminTableHeadCellClass,
} from "./admin-layout-styles";
import { AdminPageHeader } from "./admin-page-header";
import { AdminSourceBadge } from "./admin-source-badge";

type AdminOrderDetailViewProps = {
  order: AdminOrderDetail;
  locale: string;
  canMutate: boolean;
};

export function AdminOrderDetailView({ order, locale, canMutate }: AdminOrderDetailViewProps) {
  const router = useRouter();
  const [statusRaw, setStatusRaw] = useState(order.statusRaw);
  const [statusLabel, setStatusLabel] = useState(order.status);
  const [selectedStatus, setSelectedStatus] = useState(
    ADMIN_FULFILLMENT_STATUSES.includes(
      order.statusRaw as (typeof ADMIN_FULFILLMENT_STATUSES)[number],
    )
      ? order.statusRaw
      : ADMIN_FULFILLMENT_STATUSES[0],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const canUpdateStatus = canMutate && ADMIN_STATUS_UPDATABLE_FROM.has(statusRaw);

  const handleSaveStatus = async () => {
    if (!canUpdateStatus || selectedStatus === statusRaw) return;

    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const response = await fetch(`/api/admin/orders/${order.id}?locale=${locale}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectedStatus }),
      });

      const payload = (await response.json()) as { order?: AdminOrderDetail; error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to update order status");
      }

      if (payload.order) {
        setStatusRaw(payload.order.statusRaw);
        setStatusLabel(payload.order.status);
        setSelectedStatus(payload.order.statusRaw);
      } else {
        setStatusRaw(selectedStatus);
        setStatusLabel(formatOrderStatusLabel(selectedStatus));
      }

      setSaved(true);
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to update order status");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={adminPageSectionClass}>
      <div className="mb-6">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant transition-colors hover:text-primary"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to orders
        </Link>
      </div>

      <AdminPageHeader
        title={`Order #${order.orderNumber}`}
        description="Review line items, shipping details, and update fulfillment status."
        source={order.source}
      />

      {error && (
        <p className="mb-4 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}
      {saved && !error && (
        <p className="mb-4 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-primary">
          Order status updated.
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)] lg:items-start">
        <aside className="space-y-6">
          <article className="rounded-xl border border-outline-variant bg-surface-container-low p-5">
            <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
              Customer
            </h3>
            <p className="mt-3 text-base font-semibold text-primary">{order.customer}</p>
            <p className="mt-1 text-sm text-on-surface-variant">{order.email}</p>
            <p className="mt-4 text-sm text-on-surface-variant">{order.date}</p>
          </article>

          <article className="rounded-xl border border-outline-variant bg-surface-container-low p-5">
            <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
              Shipping address
            </h3>
            <address className="mt-3 space-y-1 text-sm not-italic text-on-surface">
              {order.shippingAddressLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </address>
          </article>

          <article className="rounded-xl border border-outline-variant bg-surface-container-low p-5">
            <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
              Payment
            </h3>
            <dl className="mt-3 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-on-surface-variant">Method</dt>
                <dd className="font-medium text-primary">
                  {order.paymentMethod ?? (order.isCod ? "COD" : "—")}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-on-surface-variant">Status</dt>
                <dd className="font-medium text-primary">{order.paymentStatus ?? "—"}</dd>
              </div>
            </dl>
          </article>

          <article className="rounded-xl border border-outline-variant bg-surface-container-low p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
                Fulfillment status
              </h3>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${orderStatusTone(statusRaw)}`}
              >
                {statusLabel}
              </span>
            </div>

            {canUpdateStatus ? (
              <div className="mt-4 space-y-3">
                <div>
                  <label htmlFor="order-status" className={adminLabelClassName}>
                    Update status
                  </label>
                  <select
                    id="order-status"
                    value={selectedStatus}
                    onChange={(event) => setSelectedStatus(event.target.value)}
                    className={adminFieldClassName}
                  >
                    {ADMIN_FULFILLMENT_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {formatOrderStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  disabled={saving || selectedStatus === statusRaw}
                  onClick={handleSaveStatus}
                  className="w-full rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-on-primary disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save status"}
                </button>
              </div>
            ) : (
              <p className="mt-4 text-xs leading-relaxed text-on-surface-variant">
                {!canMutate ? (
                  <>
                    Status updates require live Supabase (<AdminSourceBadge source={order.source} />
                    ).
                  </>
                ) : (
                  <>Status cannot be updated while the order is &ldquo;{statusLabel}&rdquo;.</>
                )}
              </p>
            )}
          </article>
        </aside>

        <div className="min-w-0 space-y-6">
          <article className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low">
            <div className="border-b border-outline-variant/40 px-4 py-4 sm:px-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
                Line items
              </h3>
            </div>

            {order.items.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-on-surface-variant sm:px-5">
                No line items for this order.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[720px] w-full text-left">
                  <thead className="bg-surface-container-high">
                    <tr>
                      {["Product", "SKU", "Size", "Color", "Qty", "Unit", "Total"].map(
                        (heading) => (
                          <th key={heading} className={adminTableHeadCellClass}>
                            {heading}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className={`${adminTableBodyCellClass} font-medium text-primary`}>
                          {item.productName}
                        </td>
                        <td className={`${adminTableBodyCellClass} font-mono text-xs text-on-surface-variant`}>
                          {item.sku}
                        </td>
                        <td className={adminTableBodyCellClass}>{item.sizeCode}</td>
                        <td className={adminTableBodyCellClass}>{item.colorCode}</td>
                        <td className={adminTableBodyCellClass}>{item.quantity}</td>
                        <td className={`${adminTableBodyCellClass} text-on-surface-variant`}>
                          {item.unitPrice}
                        </td>
                        <td className={`${adminTableBodyCellClass} font-semibold text-primary`}>
                          {item.lineTotal}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>

          <article className="rounded-xl border border-outline-variant bg-surface-container-low p-5">
            <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
              Order totals
            </h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-on-surface-variant">Subtotal</dt>
                <dd>{order.subtotal}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-on-surface-variant">Discount</dt>
                <dd>{order.discountTotal}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-on-surface-variant">Shipping</dt>
                <dd>{order.shippingTotal}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-on-surface-variant">Tax</dt>
                <dd>{order.taxTotal}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-outline-variant/40 pt-3 text-base font-semibold text-primary">
                <dt>Grand total</dt>
                <dd>{order.grandTotal}</dd>
              </div>
            </dl>
          </article>
        </div>
      </div>
    </section>
  );
}
