import { hasSupabaseConfig, publicEnv, serverEnv } from "@/lib/env";

export function shouldUseAdminMock(): boolean {
  return (
    publicEnv.useMockData ||
    !hasSupabaseConfig() ||
    !serverEnv.supabaseServiceRoleKey
  );
}

export function getAdminDataSource(): "supabase" | "mock" {
  return shouldUseAdminMock() ? "mock" : "supabase";
}
