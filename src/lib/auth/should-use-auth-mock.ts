import { hasSupabaseConfig } from "@/lib/env";

/** Real Supabase auth whenever the project is configured — independent of shop/cart mock. */
export function shouldUseAuthMock(): boolean {
  return !hasSupabaseConfig();
}
