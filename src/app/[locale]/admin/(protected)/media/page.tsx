import { setRequestLocale } from "next-intl/server";
import { AdminMediaView } from "@/components/admin/admin-media-view";
import { getAdminMediaData } from "@/lib/admin/media/get-admin-media-data";

type AdminMediaPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ path?: string }>;
};

export default async function AdminMediaPage({ params, searchParams }: AdminMediaPageProps) {
  const { locale } = await params;
  const { path = "" } = await searchParams;
  setRequestLocale(locale);

  const data = await getAdminMediaData(path);

  return <AdminMediaView data={data} />;
}
