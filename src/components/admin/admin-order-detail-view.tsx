"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
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
import { AdminOrderShippingPanel } from "./admin-order-shipping-panel";
import { AdminSourceBadge } from "./admin-source-badge";

type AdminOrderDetailViewProps = {
  order: AdminOrderDetail;
  locale: string;
  canMutate: boolean;
};

function toUserFriendlyError(
  fallback:
    | "update_status_failed"
    | "initiate_return_failed"
    | "approve_return_failed",
  message?: string,
): string {
  const text = (message ?? "").toLowerCase();

  if (text.includes("permission denied") || text.includes("unauthorized")) {
    return "You do not have permission to perform this action.";
  }
  if (text.includes("order item not found")) {
    return "The selected order line was not found. Refresh and try again.";
  }
  if (text.includes("order not found")) {
    return "This order no longer exists or is unavailable.";
  }
  if (text.includes("return quantity cannot exceed")) {
    return message ?? "Return quantity cannot exceed the ordered amount.";
  }
  if (text.includes("return quantity exceeds remaining returnable amount")) {
    return "Requested return quantity exceeds what is still returnable for this line.";
  }
  if (text.includes("already approved") || text.includes("already rejected")) {
    return "This return request has already been processed.";
  }
  if (text.includes("variant not found")) {
    return "The product variant for this return could not be found.";
  }
  if (text.includes("no returnable quantity left")) {
    return "No returnable quantity left for the selected line item.";
  }

  if (fallback === "update_status_failed") {
    return "Could not update order status. Please try again.";
  }
  if (fallback === "initiate_return_failed") {
    return "Could not create return request. Please review quantity and try again.";
  }
  return "Could not approve return and restock. Please try again.";
}

export function AdminOrderDetailView({ order, locale, canMutate }: AdminOrderDetailViewProps) {
  const router = useRouter();
  const [statusRaw, setStatusRaw] = useState(order.statusRaw);
  const [statusLabel, setStatusLabel] = useState(order.status);
  const [returns, setReturns] = useState(order.returns);
  const [shipping, setShipping] = useState(order.shipping);
  const [selectedStatus, setSelectedStatus] = useState(
    ADMIN_FULFILLMENT_STATUSES.includes(
      order.statusRaw as (typeof ADMIN_FULFILLMENT_STATUSES)[number],
    )
      ? order.statusRaw
      : ADMIN_FULFILLMENT_STATUSES[0],
  );
  const [returnItemId, setReturnItemId] = useState(order.items[0]?.id ?? "");
  const [returnQuantity, setReturnQuantity] = useState("1");
  const [returnReason, setReturnReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [approvingReturnId, setApprovingReturnId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const canUpdateStatus = canMutate && ADMIN_STATUS_UPDATABLE_FROM.has(statusRaw);

  const reservedByItem = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of returns) {
      if (item.status !== "pending" && item.status !== "approved") continue;
      map.set(item.orderItemId, (map.get(item.orderItemId) ?? 0) + item.quantity);
    }
    return map;
  }, [returns]);

  const selectedReturnItem = useMemo(
    () => order.items.find((item) => item.id === returnItemId),
    [order.items, returnItemId],
  );

  const maxReturnQty = Math.max(
    0,
    (selectedReturnItem?.quantity ?? 0) - (reservedByItem.get(returnItemId) ?? 0),
  );

  const syncOrderFromPayload = (payloadOrder: AdminOrderDetail | undefined) => {
    if (!payloadOrder) return;
    setStatusRaw(payloadOrder.statusRaw);
    setStatusLabel(payloadOrder.status);
    setSelectedStatus(payloadOrder.statusRaw);
    setReturns(payloadOrder.returns ?? []);
    setShipping(payloadOrder.shipping);
  };

  const handleSaveStatus = async () => {
    if (!canUpdateStatus || selectedStatus === statusRaw) return;

    setSaving(true);
    setError(null);
    setSavedMessage(null);

    try {
      const response = await fetch(`/api/admin/orders/${order.id}?locale=${locale}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectedStatus }),
      });

      const payload = (await response.json()) as { order?: AdminOrderDetail; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "");

      if (payload.order) {
        syncOrderFromPayload(payload.order);
      } else {
        setStatusRaw(selectedStatus);
        setStatusLabel(formatOrderStatusLabel(selectedStatus));
      }

      setSavedMessage("Order status updated.");
      router.refresh();
    } catch (saveError) {
      setError(
        toUserFriendlyError(
          "update_status_failed",
          saveError instanceof Error ? saveError.message : undefined,
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleInitiateReturn = async () => {
    if (!canMutate || !returnItemId) return;
    if (maxReturnQty <= 0) {
      setError("No returnable quantity left for this item.");
      return;
    }

    setSubmittingReturn(true);
    setError(null);
    setSavedMessage(null);

    try {
      const response = await fetch(`/api/admin/orders/${order.id}/returns?locale=${locale}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderItemId: returnItemId,
          quantity: Number(returnQuantity),
          reason: returnReason.trim() || null,
        }),
      });

      const payload = (await response.json()) as { order?: AdminOrderDetail; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "");

      syncOrderFromPayload(payload.order);
      setSavedMessage("Return request created.");
      setReturnReason("");
      setReturnQuantity("1");
      router.refresh();
    } catch (returnError) {
      setError(
        toUserFriendlyError(
          "initiate_return_failed",
          returnError instanceof Error ? returnError.message : undefined,
        ),
      );
    } finally {
      setSubmittingReturn(false);
    }
  };

  const handleApproveReturn = async (returnId: string) => {
    if (!canMutate) return;

    setApprovingReturnId(returnId);
    setError(null);
    setSavedMessage(null);

    try {
      const response = await fetch(
        `/api/admin/orders/${order.id}/returns/${returnId}/approve?locale=${locale}`,
        { method: "POST" },
      );

      const payload = (await response.json()) as { order?: AdminOrderDetail; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "");

      syncOrderFromPayload(payload.order);
      setSavedMessage("Return approved and stock restocked.");
      router.refresh();
    } catch (approveError) {
      setError(
        toUserFriendlyError(
          "approve_return_failed",
          approveError instanceof Error ? approveError.message : undefined,
        ),
      );
    } finally {
      setApprovingReturnId(null);
    }
  };

  const selectItemForReturn = (itemId: string) => {
    setReturnItemId(itemId);
    setReturnQuantity("1");
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
        description="Review line items, shipping details, and manage returns with restock approval."
        source={order.source}
      />

      {error && (
        <p className="mb-4 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}
      {savedMessage && !error && (
        <p className="mb-4 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-primary">
          {savedMessage}
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

          <AdminOrderShippingPanel
            order={{ ...order, shipping }}
            locale={locale}
            canMutate={canMutate}
            onOrderUpdated={(next) => {
              syncOrderFromPayload(next);
              router.refresh();
            }}
            onError={(message) => {
              setSavedMessage(null);
              setError(message);
            }}
            onSuccess={(message) => {
              setError(null);
              setSavedMessage(message);
            }}
          />

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
                    Status updates require live Supabase (<AdminSourceBadge source={order.source} />).
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
                      {["Product", "SKU", "Size", "Color", "Qty", "Unit", "Total", "Return"].map(
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
                        <td className={adminTableBodyCellClass}>
                          {(() => {
                            const returnableQty = Math.max(
                              0,
                              item.quantity - (reservedByItem.get(item.id) ?? 0),
                            );
                            if (!canMutate) {
                              return (
                                <span className="text-xs text-on-surface-variant">
                                  {returnableQty} returnable
                                </span>
                              );
                            }
                            return (
                              <button
                                type="button"
                                onClick={() => selectItemForReturn(item.id)}
                                disabled={returnableQty <= 0}
                                className="rounded-lg border border-outline-variant px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-primary hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {returnableQty > 0
                                  ? `Return (${returnableQty})`
                                  : "No qty left"}
                              </button>
                            );
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>

          <article className="rounded-xl border border-outline-variant bg-surface-container-low p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
                Returns management
              </h3>
              <span className="rounded-full bg-surface-container-high px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-primary">
                {returns.length} requests
              </span>
            </div>

            {canMutate ? (
              <div className="grid gap-3 rounded-lg border border-outline-variant/50 bg-surface-container-lowest p-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={adminLabelClassName} htmlFor="return-item-id">
                    Order item
                  </label>
                  <select
                    id="return-item-id"
                    value={returnItemId}
                    onChange={(event) => selectItemForReturn(event.target.value)}
                    className={adminFieldClassName}
                  >
                    {order.items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.productName} · {item.sku} · {item.sizeCode}/{item.colorCode} · Qty{" "}
                        {item.quantity} (returnable{" "}
                        {Math.max(0, item.quantity - (reservedByItem.get(item.id) ?? 0))})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={adminLabelClassName} htmlFor="return-qty">
                    Return quantity
                  </label>
                  <input
                    id="return-qty"
                    type="number"
                    min={1}
                    max={maxReturnQty || 1}
                    value={returnQuantity}
                    onChange={(event) => setReturnQuantity(event.target.value)}
                    className={adminFieldClassName}
                    disabled={maxReturnQty <= 0}
                  />
                  <p className="mt-2 text-xs text-on-surface-variant">
                    Max returnable for selected line: {maxReturnQty}
                  </p>
                </div>
                <div>
                  <label className={adminLabelClassName} htmlFor="return-reason">
                    Reason (optional)
                  </label>
                  <input
                    id="return-reason"
                    value={returnReason}
                    onChange={(event) => setReturnReason(event.target.value)}
                    className={adminFieldClassName}
                    placeholder="Damaged, wrong size, etc."
                  />
                </div>
                <button
                  type="button"
                  onClick={handleInitiateReturn}
                  disabled={submittingReturn || !returnItemId || maxReturnQty <= 0}
                  className="sm:col-span-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-on-primary disabled:opacity-50"
                >
                  {submittingReturn ? "Creating…" : "Initiate return"}
                </button>
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant">
                Returns actions require live Supabase (<AdminSourceBadge source={order.source} />).
              </p>
            )}

            <div className="mt-5 space-y-3">
              {returns.length === 0 ? (
                <p className="text-sm text-on-surface-variant">No return requests for this order.</p>
              ) : (
                returns.map((ret) => {
                  const item = order.items.find((line) => line.id === ret.orderItemId);
                  return (
                    <div
                      key={ret.id}
                      className="rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-primary">
                          {item?.productName ?? "Order item"} · Qty {ret.quantity}
                        </p>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${
                            ret.status === "approved"
                              ? "bg-primary/15 text-primary"
                              : ret.status === "rejected"
                                ? "bg-error/15 text-error"
                                : "bg-surface-container-high text-on-surface"
                          }`}
                        >
                          {ret.statusLabel}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-on-surface-variant">
                        Created {ret.createdAt}
                        {ret.restockedAt ? ` · Restocked ${ret.restockedAt}` : ""}
                      </p>
                      {ret.reason ? (
                        <p className="mt-2 text-sm text-on-surface-variant">Reason: {ret.reason}</p>
                      ) : null}
                      {canMutate && ret.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => void handleApproveReturn(ret.id)}
                          disabled={approvingReturnId === ret.id}
                          className="mt-3 rounded-lg border border-outline-variant px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-primary hover:bg-surface-container disabled:opacity-50"
                        >
                          {approvingReturnId === ret.id ? "Approving…" : "Approve & restock"}
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
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
