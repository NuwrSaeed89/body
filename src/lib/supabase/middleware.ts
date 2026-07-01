import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { hasSupabaseConfig, publicEnv } from "@/lib/env";

/**
 * Refreshes the Supabase Auth session cookie on each matched request.
 * Pass an existing response (e.g. from next-intl) to preserve its headers/cookies.
 */
export async function updateSupabaseSession(
  request: NextRequest,
  response = NextResponse.next({ request }),
) {
  if (!hasSupabaseConfig()) {
    return response;
  }

  const supabase = createServerClient(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  await supabase.auth.getUser();
  return response;
}
