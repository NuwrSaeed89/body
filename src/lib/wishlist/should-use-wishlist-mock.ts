import { hasSupabaseConfig, publicEnv } from "@/lib/env";

export function shouldUseWishlistMock(): boolean {
  return publicEnv.useMockData || !hasSupabaseConfig();
}
