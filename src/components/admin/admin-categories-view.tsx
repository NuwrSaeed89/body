import type { AdminCategoriesData } from "@/lib/admin/categories/types";
import { adminPageSectionClass } from "./admin-layout-styles";
import { AdminCategoriesClient } from "./admin-categories-client";

type AdminCategoriesViewProps = {
  data: AdminCategoriesData;
};

export function AdminCategoriesView({ data }: AdminCategoriesViewProps) {
  const canMutate = data.source === "supabase";

  return (
    <section className={adminPageSectionClass}>
      <AdminCategoriesClient categories={data.categories} canMutate={canMutate} />
    </section>
  );
}
