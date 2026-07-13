import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAdminOrderDetail } from "@/lib/admin/get-admin-order-detail";
import { AdminOrderLabelPrintButton } from "@/components/admin/admin-order-label-print-button";

type AdminOrderLabelPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function AdminOrderLabelPage({ params }: AdminOrderLabelPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const order = await getAdminOrderDetail(id, locale);
  if (!order) notFound();

  const shipping = order.shipping;

  return (
    <main className="mx-auto max-w-2xl bg-white px-6 py-10 text-black print:max-w-none print:px-0 print:py-0">
      <div className="mb-6 flex items-center justify-between gap-4 print:hidden">
        <Link
          href={`/admin/orders/${order.id}`}
          className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-600 underline underline-offset-2"
        >
          Back to order
        </Link>
        <AdminOrderLabelPrintButton />
      </div>

      <section className="border-2 border-black p-6">
        <header className="mb-6 flex items-start justify-between gap-4 border-b border-black pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em]">Mbody</p>
            <h1 className="mt-2 text-2xl font-semibold">Shipping label</h1>
            <p className="mt-1 text-sm text-neutral-600">Order #{order.orderNumber}</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold">{shipping.carrierLabel ?? "Carrier TBD"}</p>
            <p>{shipping.serviceLabel ?? "—"}</p>
          </div>
        </header>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">
              Ship to
            </p>
            <address className="mt-2 space-y-1 text-sm not-italic">
              {order.shippingAddressLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </address>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">
              Tracking
            </p>
            <p className="mt-2 font-mono text-lg font-semibold tracking-wide">
              {shipping.trackingNumber ?? "—"}
            </p>
            {shipping.trackingUrl ? (
              <p className="mt-2 break-all text-xs text-neutral-600">{shipping.trackingUrl}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-8 border-t border-dashed border-black pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">
            Contents
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {order.items.map((item) => (
              <li key={item.id}>
                {item.quantity}× {item.productName} · {item.sizeCode}/{item.colorCode} · {item.sku}
              </li>
            ))}
          </ul>
        </div>

        {shipping.notes ? (
          <p className="mt-6 text-xs text-neutral-600">Note: {shipping.notes}</p>
        ) : null}
      </section>
    </main>
  );
}
