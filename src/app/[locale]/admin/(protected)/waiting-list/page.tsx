import { setRequestLocale } from "next-intl/server";
import { AdminWaitingListView } from "@/components/admin/admin-waiting-list-view";
import { getAdminWaitingListData } from "@/lib/admin/waiting-list/get-admin-waiting-list";

type AdminWaitingListPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ product?: string }>;
};

export default async function AdminWaitingListPage({
  params,
  searchParams,
}: AdminWaitingListPageProps) {
  const { locale } = await params;
  const { product } = await searchParams;
  setRequestLocale(locale);

  const data = await getAdminWaitingListData(locale);

  return (
    <AdminWaitingListView
      data={data}
      initialProductFilter={typeof product === "string" ? product.trim() : ""}
    />
  );
}
