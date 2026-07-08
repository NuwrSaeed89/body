import { setRequestLocale } from "next-intl/server";
import { AdminOrdersView } from "@/components/admin/admin-orders-view";
import { getAdminOrdersData } from "@/lib/admin/get-admin-orders";
import { parseAdminOrderFilters } from "@/lib/admin/orders/filters";

type AdminOrdersPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminOrdersPage({ params, searchParams }: AdminOrdersPageProps) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);

  const filters = parseAdminOrderFilters(query);
  const data = await getAdminOrdersData(locale, filters);

  return <AdminOrdersView data={data} filters={filters} />;
}
