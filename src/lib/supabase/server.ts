import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { hasSupabaseConfig, publicEnv } from "@/lib/env";
import {
  createSupabaseSsrCookieHandlers,
  supabaseSsrAuthOptions,
} from "@/lib/supabase/ssr-options";

export async function createSupabaseServerClient() {
  if (!hasSupabaseConfig()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    ...supabaseSsrAuthOptions,
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
