import "server-only";

import { redirect } from "next/navigation";
import { getServerSessionUser } from "./get-session";
import { shouldUseAuthMock } from "./should-use-auth-mock";

export async function requireUser(locale: string, redirectPath: string) {
  if (shouldUseAuthMock()) {
    return { id: "mock-user", email: "mock@example.com" };
  }

  const user = await getServerSessionUser();
  if (!user) {
    redirect(`/${locale}/account/login?redirect=${encodeURIComponent(redirectPath)}`);
  }
  return user;
}
