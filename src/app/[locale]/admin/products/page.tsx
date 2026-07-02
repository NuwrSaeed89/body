import { setRequestLocale } from "next-intl/server";
import { AdminProductsView } from "@/components/admin/admin-products-view";
import { getAdminCategories } from "@/lib/admin/categories/get-admin-categories";
import { getAdminProductsData } from "@/lib/admin/get-admin-products";

type AdminProductsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminProductsPage({ params }: AdminProductsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [data, categories] = await Promise.all([
    getAdminProductsData(locale),
    getAdminCategories(locale),
  ]);

  return <AdminProductsView data={data} categories={categories} locale={locale} />;
}
