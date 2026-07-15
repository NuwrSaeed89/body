import type { AdminWaitingListData } from "@/lib/admin/waiting-list/types";
import { adminPageSectionClass } from "./admin-layout-styles";
import { AdminWaitingListClient } from "./admin-waiting-list-client";

type AdminWaitingListViewProps = {
  data: AdminWaitingListData;
  initialProductFilter?: string;
};

export function AdminWaitingListView({
  data,
  initialProductFilter = "",
}: AdminWaitingListViewProps) {
  const canMutate = data.source === "supabase";

  return (
    <section className={adminPageSectionClass}>
      <AdminWaitingListClient
        rows={data.rows}
        source={data.source}
        totalCount={data.totalCount}
        waitingCount={data.waitingCount}
        notifiedCount={data.notifiedCount}
        canMutate={canMutate}
        initialProductFilter={initialProductFilter}
      />
    </section>
  );
}
