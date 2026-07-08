import { readSessionUserFromCookies } from "@/lib/auth/get-session";
import { shouldUseAuthMock } from "@/lib/auth/should-use-auth-mock";

/**
 * Read-only session probe for the browser client.
 * Token refresh is handled by the browser Supabase client (autoRefreshToken).
 * Server-side refresh here races with the browser and invalidates refresh tokens.
 */
export async function GET() {
  if (shouldUseAuthMock()) {
    return Response.json({ authenticated: false });
  }

  const user = await readSessionUserFromCookies();
  return Response.json({ authenticated: Boolean(user) });
}
