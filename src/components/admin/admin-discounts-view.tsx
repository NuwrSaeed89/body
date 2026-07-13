import type { AdminDiscountsData } from "@/lib/admin/discounts/types";
import { adminPageSectionClass } from "./admin-layout-styles";
import { AdminDiscountsClient } from "./admin-discounts-client";

type AdminDiscountsViewProps = {
  data: AdminDiscountsData;
};

export function AdminDiscountsView({ data }: AdminDiscountsViewProps) {
  const canMutate = data.source === "supabase";

  return (
    <section className={adminPageSectionClass}>
      <AdminDiscountsClient discounts={data.discounts} canMutate={canMutate} />
    </section>
  );
}
