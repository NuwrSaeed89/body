import { hasSupabaseConfig, publicEnv } from "@/lib/env";

export function shouldUseCartMock(): boolean {
  return publicEnv.useMockData || !hasSupabaseConfig();
}
