import { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { getServerAdminUser } from "@/lib/auth/get-session";
import { hasSupabaseConfig } from "@/lib/env";

export const metadata: Metadata = {
  title: "Admin Sign In — Mbody",
  robots: { index: false, follow: false },
};

type AdminLoginPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminLoginPage({ params }: AdminLoginPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (hasSupabaseConfig()) {
    const admin = await getServerAdminUser();
    if (admin) {
      redirect(`/${locale}/admin`);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-container-low px-5 py-16">
      <div className="w-full max-w-md rounded-2xl border border-outline-variant bg-surface p-8 shadow-sm md:p-10">
        <div className="mb-8 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
            Staff only
          </p>
          <h1 className="mt-2 text-2xl font-black text-primary">Mbody Admin</h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Management portal — authorized accounts only
          </p>
        </div>

        <Suspense fallback={null}>
          <AdminLoginForm />
        </Suspense>

        <p className="mt-8 text-center text-[10px] uppercase tracking-widest text-on-surface-variant/70">
          Session secured via Supabase Auth
        </p>
      </div>
    </div>
  );
}
