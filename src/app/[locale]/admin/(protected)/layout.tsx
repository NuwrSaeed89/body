import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminDataSource } from "@/lib/admin/should-use-mock";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

type ProtectedAdminLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function ProtectedAdminLayout({
  children,
  params,
}: ProtectedAdminLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const admin = await requireAdmin(locale, `/${locale}/admin`);
  const source = getAdminDataSource();

  return (
    <AdminShell
      source={source}
      managerName={admin.full_name ?? admin.email}
      managerRole="Administrator"
    >
      {children}
    </AdminShell>
  );
}
