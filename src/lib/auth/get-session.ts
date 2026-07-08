import "server-only";

import { cache } from "react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
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

/**
 * Reads the user from auth cookies without Supabase Auth HTTP calls.
 * Uncached — use in Route Handlers where React cache() is unreliable.
 */
export async function readSessionUserFromCookies() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.email) return null;

    // Trust cookies: active access token OR refresh token keeps the user signed in.
    // Token refresh is handled only in the browser — never call getUser() here.
    if (isSessionActive(session) || session.refresh_token) {
      return session.user;
    }

    return null;
  } catch {
    return null;
  }
}

/** Per-request dedupe for Server Components only. */
const getSessionUser = cache(readSessionUserFromCookies);

async function resolveAdminUser(
  user: Awaited<ReturnType<typeof readSessionUserFromCookies>>,
): Promise<AdminSessionUser | null> {
  if (!user?.email) return null;

  const supabase = createSupabaseAdminClient();
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

/**
 * Admin auth for Route Handlers — always reads cookies fresh (no React cache).
 */
export async function resolveAdminUserFromCookies(): Promise<AdminSessionUser | null> {
  if (shouldUseAuthMock()) return null;

  const user = await readSessionUserFromCookies();
  return resolveAdminUser(user);
}

export const getServerSessionUser = cache(async (): Promise<AuthSessionUser | null> => {
  if (shouldUseAuthMock()) return null;

  const user = await getSessionUser();
  if (!user?.email) return null;

  return {
    id: user.id,
    email: user.email.toLowerCase(),
  };
});

export const getServerProfile = cache(async (): Promise<AuthProfile | null> => {
  if (shouldUseAuthMock()) return null;

  const user = await getSessionUser();
  if (!user?.email) return null;

  const supabase = createSupabaseAdminClient();
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
});

export const getServerAdminUser = cache(async (): Promise<AdminSessionUser | null> => {
  if (shouldUseAuthMock()) return null;

  const user = await getSessionUser();
  return resolveAdminUser(user);
});
