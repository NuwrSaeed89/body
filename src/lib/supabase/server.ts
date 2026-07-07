import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { hasSupabaseConfig, publicEnv } from "@/lib/env";
import {
  createSupabaseSsrCookieHandlers,
  supabaseNodeRefreshAuthOptions,
  supabaseSsrAuthOptions,
} from "@/lib/supabase/ssr-options";

type CreateServerClientOptions = {
  /** Allow token refresh on Node (route handlers / get-session fallback). */
  refresh?: boolean;
};

export async function createSupabaseServerClient(
  options: CreateServerClientOptions = {},
) {
  if (!hasSupabaseConfig()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
    );
  }

  const cookieStore = await cookies();
  const authOptions = options.refresh
    ? supabaseNodeRefreshAuthOptions
    : supabaseSsrAuthOptions;

  return createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    ...authOptions,
    cookies: createSupabaseSsrCookieHandlers({
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options: cookieOptions }) => {
            cookieStore.set(name, value, cookieOptions);
          });
        } catch {
          /* Server Components cannot always write cookies — use /api/auth/session */
        }
      },
    }),
  });
}
