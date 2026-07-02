import type { AdminCategoryOption } from "@/lib/admin/categories/types";
import type { AdminProductsData } from "@/lib/admin/list-types";
import { adminPageSectionClass } from "./admin-layout-styles";
import { AdminProductsClient } from "./admin-products-client";

type AdminProductsViewProps = {
  data: AdminProductsData;
  categories: AdminCategoryOption[];
  locale: string;
};

export function AdminProductsView({ data, categories, locale }: AdminProductsViewProps) {
  const canMutate = data.source === "supabase";

  return (
    <section className={adminPageSectionClass}>
      <AdminProductsClient
        products={data.products}
        categories={categories}
        locale={locale}
        canMutate={canMutate}
      />
    </section>
  );
}
