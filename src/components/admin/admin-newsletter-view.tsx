import type { AdminNewsletterData } from "@/lib/admin/newsletter/types";
import { AdminNewsletterClient } from "./admin-newsletter-client";

type AdminNewsletterViewProps = {
  data: AdminNewsletterData;
};

export function AdminNewsletterView({ data }: AdminNewsletterViewProps) {
  return (
    <AdminNewsletterClient
      subscribers={data.subscribers}
      source={data.source}
      totalCount={data.totalCount}
      pendingConfirmationCount={data.pendingConfirmationCount}
      pendingEspSyncCount={data.pendingEspSyncCount}
      esp={data.esp}
    />
  );
}
