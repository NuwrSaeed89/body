import { hasSupabaseConfig, publicEnv } from "@/lib/env";

export function shouldUseStorefrontMock(): boolean {
  return publicEnv.useMockData || !hasSupabaseConfig();
}
