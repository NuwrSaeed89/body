import type { AdminMediaData } from "@/lib/admin/media/types";
import { adminPageSectionClass } from "./admin-layout-styles";
import { AdminMediaBrowser } from "./admin-media-browser";

type AdminMediaViewProps = {
  data: AdminMediaData;
};

export function AdminMediaView({ data }: AdminMediaViewProps) {
  return (
    <section className={adminPageSectionClass}>
      <AdminMediaBrowser initialData={data} />
    </section>
  );
}
