import { setRequestLocale } from "next-intl/server";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

type AdminPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminPage({ params }: AdminPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AdminDashboard />;
}
