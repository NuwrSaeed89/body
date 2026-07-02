import { setRequestLocale } from "next-intl/server";
import { AdminOrdersView } from "@/components/admin/admin-orders-view";
import { getAdminOrdersData } from "@/lib/admin/get-admin-orders";

type AdminOrdersPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminOrdersPage({ params }: AdminOrdersPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const data = await getAdminOrdersData(locale);

  return <AdminOrdersView data={data} />;
}
