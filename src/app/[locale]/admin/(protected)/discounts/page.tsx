import { setRequestLocale } from "next-intl/server";
import { AdminDiscountsView } from "@/components/admin/admin-discounts-view";
import { getAdminDiscountsData } from "@/lib/admin/discounts/get-admin-discounts";

type AdminDiscountsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminDiscountsPage({ params }: AdminDiscountsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const data = await getAdminDiscountsData(locale);

  return <AdminDiscountsView data={data} />;
}
