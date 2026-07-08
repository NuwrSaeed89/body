import { type NextRequest, NextResponse } from "next/server";

/**
 * Passes auth cookies through unchanged. Token refresh runs only in the browser
 * (AuthProvider) to avoid racing Supabase Auth and hitting rate limits on the server.
 */
export async function updateSupabaseSession(
  _request: NextRequest,
  baseResponse: NextResponse,
): Promise<NextResponse> {
  return baseResponse;
}
