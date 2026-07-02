import "server-only";

import { redirect } from "next/navigation";
import { hasSupabaseConfig } from "@/lib/env";
import { getServerAdminUser, type AdminSessionUser } from "./get-session";

export async function requireAdmin(
  locale: string,
  redirectPath: string,
): Promise<AdminSessionUser> {
  if (!hasSupabaseConfig()) {
    return {
      id: "dev-admin",
      email: "dev@localhost",
      full_name: "Dev Admin",
      role: "admin",
    };
  }

  const admin = await getServerAdminUser();
  if (!admin) {
    redirect(`/${locale}/admin/login?redirect=${encodeURIComponent(redirectPath)}`);
  }
  return admin;
}
