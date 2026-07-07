import type { CookieOptions } from "@supabase/ssr";

type CookieStore = {
  getAll: () => { name: string; value: string }[];
  setAll: (
    cookies: { name: string; value: string; options: CookieOptions }[],
  ) => void;
};

/** Edge / read-only SSR — no network refresh (avoids Edge fetch failures). */
export const supabaseSsrAuthOptions = {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
} as const;

/** Node route handlers — may refresh tokens and write cookies. */
export const supabaseNodeRefreshAuthOptions = {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: false,
    persistSession: false,
  },
} as const;

/** Browser — keep users signed in until explicit sign-out. */
export const supabaseBrowserAuthOptions = {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true,
  },
} as const;

export function createSupabaseSsrCookieHandlers(store: CookieStore) {
  return {
    getAll() {
      return store.getAll();
    },
    setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
      store.setAll(cookiesToSet);
    },
  };
}

/**
 * Session is valid while the access token is active OR a refresh token remains.
 * Supabase refresh tokens last days/weeks — user stays signed in until sign-out.
 */
export function isSessionActive(session: {
  user: unknown;
  expires_at?: number;
  refresh_token?: string;
} | null): boolean {
  if (!session?.user) return false;

  const now = Math.floor(Date.now() / 1000);
  if ((session.expires_at ?? 0) > now) return true;

  return Boolean(session.refresh_token);
}
