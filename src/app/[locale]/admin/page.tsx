import { setRequestLocale } from "next-intl/server";
import { AdminOverview } from "@/components/admin/admin-overview";
import { getAdminDashboardData } from "@/lib/admin/get-admin-dashboard-data";

type AdminPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminPage({ params }: AdminPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const data = await getAdminDashboardData(locale);

  return <AdminOverview data={data} />;
}
