import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { AdminOrderDetailView } from "@/components/admin/admin-order-detail-view";
import { getAdminOrderDetail } from "@/lib/admin/get-admin-order-detail";

type AdminOrderDetailPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const order = await getAdminOrderDetail(id, locale);
  if (!order) notFound();

  return (
    <AdminOrderDetailView
      order={order}
      locale={locale}
      canMutate={order.source === "supabase"}
    />
  );
}
