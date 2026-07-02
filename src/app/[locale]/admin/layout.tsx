import { getAdminDataSource } from "@/lib/admin/should-use-mock";
import { AdminShell } from "@/components/admin/admin-shell";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const source = getAdminDataSource();

  return (
    <AdminShell
      source={source}
      managerName="Mbody Admin"
      managerRole={source === "supabase" ? "Live store data" : "Demo mode"}
    >
      {children}
    </AdminShell>
  );
}
