import { setRequestLocale } from "next-intl/server";
import { AdminNewsletterView } from "@/components/admin/admin-newsletter-view";
import { getAdminNewsletterData } from "@/lib/admin/newsletter/get-admin-newsletter";

type AdminNewsletterPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminNewsletterPage({ params }: AdminNewsletterPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const data = await getAdminNewsletterData(locale);

  return <AdminNewsletterView data={data} />;
}
