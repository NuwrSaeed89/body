import type { AdminOrdersData } from "@/lib/admin/list-types";
import type { AdminOrderFilters } from "@/lib/admin/orders/filters";
import { adminPageSectionClass } from "./admin-layout-styles";
import { AdminOrdersClient } from "./admin-orders-client";

type AdminOrdersViewProps = {
  data: AdminOrdersData;
  filters: AdminOrderFilters;
};

export function AdminOrdersView({ data, filters }: AdminOrdersViewProps) {
  return (
    <section className={adminPageSectionClass}>
      <AdminOrdersClient data={data} filters={filters} />
    </section>
  );
}
