import { setRequestLocale } from "next-intl/server";
import { AdminCustomersView } from "@/components/admin/admin-customers-view";
import { getAdminCustomersData } from "@/lib/admin/get-admin-customers";

type AdminCustomersPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminCustomersPage({ params }: AdminCustomersPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const data = await getAdminCustomersData(locale);

  return <AdminCustomersView data={data} />;
}
