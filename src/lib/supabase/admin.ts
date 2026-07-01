import { createClient } from "@supabase/supabase-js";
import { hasSupabaseConfig, publicEnv, serverEnv } from "@/lib/env";

/**
 * Service-role client — bypasses RLS. Use only in Route Handlers / Server Actions / webhooks.
 * Never import from client components.
 */
export function createSupabaseAdminClient() {
  if (!hasSupabaseConfig()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  if (!serverEnv.supabaseServiceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for admin/server writes.",
    );
  }

  return createClient(publicEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
