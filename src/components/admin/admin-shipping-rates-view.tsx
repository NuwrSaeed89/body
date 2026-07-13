import type { AdminShippingRatesData } from "@/lib/admin/shipping/types";
import { adminPageSectionClass } from "./admin-layout-styles";
import { AdminShippingRatesClient } from "./admin-shipping-rates-client";

type AdminShippingRatesViewProps = {
  data: AdminShippingRatesData;
};

export function AdminShippingRatesView({ data }: AdminShippingRatesViewProps) {
  const canMutate = data.source === "supabase";

  return (
    <section className={adminPageSectionClass}>
      <AdminShippingRatesClient rates={data.rates} canMutate={canMutate} />
    </section>
  );
}
