import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { shouldUseAuthMock } from "@/lib/auth/should-use-auth-mock";

export type AuthSessionUser = {
  id: string;
  email: string;
};

export type AuthProfile = {
  id: string;
  email: string;
  full_name: string | null;
};

export type AdminSessionUser = {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin";
};

export async function getServerSessionUser(): Promise<AuthSessionUser | null> {
  if (shouldUseAuthMock()) return null;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;
  return {
    id: user.id,
    email: user.email.toLowerCase(),
  };
}

export async function getServerProfile(): Promise<AuthProfile | null> {
  if (shouldUseAuthMock()) return null;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email.toLowerCase(),
    full_name: profile?.full_name ?? null,
  };
}

export async function getServerAdminUser(): Promise<AdminSessionUser | null> {
  if (shouldUseAuthMock()) return null;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") return null;

  return {
    id: user.id,
    email: user.email.toLowerCase(),
    full_name: profile?.full_name ?? null,
    role: "admin",
  };
}
