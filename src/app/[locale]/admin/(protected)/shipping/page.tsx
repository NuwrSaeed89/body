import { setRequestLocale } from "next-intl/server";
import { AdminShippingRatesView } from "@/components/admin/admin-shipping-rates-view";
import { getAdminShippingRatesData } from "@/lib/admin/shipping/get-admin-shipping-rates";

type AdminShippingPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminShippingPage({ params }: AdminShippingPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const data = await getAdminShippingRatesData(locale);

  return <AdminShippingRatesView data={data} />;
}
