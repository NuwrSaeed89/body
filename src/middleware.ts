import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

const handleI18nRouting = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  const intlResponse = handleI18nRouting(request);
  return updateSupabaseSession(request, intlResponse);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
