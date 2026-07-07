"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { hasSupabaseConfig, publicEnv } from "@/lib/env";
import { supabaseBrowserAuthOptions } from "@/lib/supabase/ssr-options";

let browserClient: SupabaseClient | null = null;

export function createSupabaseBrowserClient() {
  if (!hasSupabaseConfig()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
    );
  }

  if (!browserClient) {
    browserClient = createBrowserClient(
      publicEnv.supabaseUrl,
      publicEnv.supabaseAnonKey,
      supabaseBrowserAuthOptions,
    );
  }

  return browserClient;
}
