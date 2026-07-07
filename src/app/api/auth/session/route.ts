import { getServerSessionUser } from "@/lib/auth/get-session";
import { shouldUseAuthMock } from "@/lib/auth/should-use-auth-mock";

/** Lightweight session probe — read cookies only; browser client owns token refresh. */
export async function GET() {
  if (shouldUseAuthMock()) {
    return Response.json({ authenticated: false });
  }

  const user = await getServerSessionUser();
  return Response.json({ authenticated: Boolean(user) });
}
