import { hasSupabaseConfig, publicEnv, serverEnv } from "@/lib/env";

export type SupabaseConfigStatus = {
  configured: boolean;
  urlSet: boolean;
  anonKeySet: boolean;
  serviceRoleKeySet: boolean;
  useMockData: boolean;
  missing: string[];
  recommended: string[];
};

export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  const urlSet = Boolean(publicEnv.supabaseUrl);
  const anonKeySet = Boolean(publicEnv.supabaseAnonKey);
  const serviceRoleKeySet = Boolean(serverEnv.supabaseServiceRoleKey);
  const configured = hasSupabaseConfig();

  const missing: string[] = [];
  const recommended: string[] = [];
  if (!urlSet) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!anonKeySet) {
    missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)");
  }
  if (!serviceRoleKeySet) recommended.push("SUPABASE_SERVICE_ROLE_KEY");

  return {
    configured,
    urlSet,
    anonKeySet,
    serviceRoleKeySet,
    useMockData: publicEnv.useMockData,
    missing,
    recommended,
  };
}
