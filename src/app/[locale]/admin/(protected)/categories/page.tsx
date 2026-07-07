import { setRequestLocale } from "next-intl/server";
import { AdminCategoriesView } from "@/components/admin/admin-categories-view";
import { getAdminCategoriesData } from "@/lib/admin/categories/get-admin-categories-data";

type AdminCategoriesPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminCategoriesPage({ params }: AdminCategoriesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const data = await getAdminCategoriesData(locale);

  return <AdminCategoriesView data={data} />;
}
