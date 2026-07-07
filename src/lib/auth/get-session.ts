import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSessionActive } from "@/lib/supabase/ssr-options";
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

async function refreshSessionUser() {
  try {
    const supabase = await createSupabaseServerClient({ refresh: true });
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user?.email) return null;
    return user;
  } catch {
    return null;
  }
}

/**
 * Reads session from cookies. Refreshes on Node when the access token expired
 * but a refresh token is still present — keeps users signed in until sign-out.
 */
async function getSessionUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) return null;
  if (isSessionActive(session)) return session.user;

  if (!session.refresh_token) return null;
  return refreshSessionUser();
}

export async function getServerSessionUser(): Promise<AuthSessionUser | null> {
  if (shouldUseAuthMock()) return null;

  const user = await getSessionUser();
  if (!user?.email) return null;

  return {
    id: user.id,
    email: user.email.toLowerCase(),
  };
}

export async function getServerProfile(): Promise<AuthProfile | null> {
  if (shouldUseAuthMock()) return null;

  const user = await getSessionUser();
  if (!user?.email) return null;

  const supabase = await createSupabaseServerClient();
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

  const user = await getSessionUser();
  if (!user?.email) return null;

  const supabase = await createSupabaseServerClient();
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
