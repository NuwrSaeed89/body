"use client";

import { createBrowserClient } from "@supabase/ssr";
import { hasSupabaseConfig, publicEnv } from "@/lib/env";

export function createSupabaseBrowserClient() {
  if (!hasSupabaseConfig()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
    );
  }

  return createBrowserClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey);
}
