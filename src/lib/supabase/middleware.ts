import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { hasSupabaseConfig, publicEnv } from "@/lib/env";
import {
  createSupabaseSsrCookieHandlers,
  supabaseSsrAuthOptions,
} from "@/lib/supabase/ssr-options";

function recreateResponse(request: NextRequest, previous: NextResponse): NextResponse {
  const location = previous.headers.get("location");
  if (location) {
    return NextResponse.redirect(new URL(location, request.url), previous.status);
  }
  return NextResponse.next({ request });
}

/**
 * Syncs auth cookies on the response without network calls.
 * Token refresh runs in the browser (AuthProvider) — Edge fetch to Supabase often fails in dev.
 */
export async function updateSupabaseSession(
  request: NextRequest,
  baseResponse: NextResponse,
): Promise<NextResponse> {
  if (!hasSupabaseConfig()) {
    return baseResponse;
  }

  let response = baseResponse;

  try {
    const supabase = createServerClient(
      publicEnv.supabaseUrl,
      publicEnv.supabaseAnonKey,
      {
        ...supabaseSsrAuthOptions,
        cookies: createSupabaseSsrCookieHandlers({
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value);
            });
            response = recreateResponse(request, response);
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        }),
      },
    );

    await supabase.auth.getSession();
  } catch {
    /* Never block navigation on auth sync errors */
  }

  return response;
}
