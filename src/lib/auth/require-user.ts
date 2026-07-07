import "server-only";

import { redirect } from "next/navigation";
import { getServerSessionUser } from "./get-session";
import { shouldUseAuthMock } from "./should-use-auth-mock";

/** Strip locale prefix so next-intl router.push works after login. */
function toAppRedirectPath(locale: string, path: string): string {
  const prefix = `/${locale}`;
  if (path === prefix) return "/";
  if (path.startsWith(`${prefix}/`)) return path.slice(prefix.length);
  return path;
}

export async function requireUser(locale: string, redirectPath: string) {
  if (shouldUseAuthMock()) {
    return { id: "mock-user", email: "mock@example.com" };
  }

  const user = await getServerSessionUser();
  if (!user) {
    const appRedirect = toAppRedirectPath(locale, redirectPath);
    redirect(
      `/${locale}/account/login?redirect=${encodeURIComponent(appRedirect)}`,
    );
  }
  return user;
}
