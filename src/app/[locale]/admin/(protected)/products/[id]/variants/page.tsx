import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { AdminProductVariantsView } from "@/components/admin/admin-product-variants-view";
import { getAdminProductsData } from "@/lib/admin/get-admin-products";
import { getAdminDataSource } from "@/lib/admin/should-use-mock";

type AdminProductVariantsPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function AdminProductVariantsPage({
  params,
}: AdminProductVariantsPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const data = await getAdminProductsData(locale);
  const product = data.products.find((row) => row.id === id);
  if (!product) notFound();

  const source = getAdminDataSource();

  return (
    <AdminProductVariantsView
      product={product}
      locale={locale}
      source={source}
      canMutate={source === "supabase"}
    />
  );
}
