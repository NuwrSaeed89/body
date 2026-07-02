import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { isComingSoonActive } from "@/lib/launch-config";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

const handleI18nRouting = createIntlMiddleware(routing);

const localePattern = routing.locales.join("|");

function isComingSoonPathAllowed(pathname: string): boolean {
  if (pathname.startsWith("/api")) return true;
  if (new RegExp(`^/(${localePattern})/?$`).test(pathname)) return true;
  if (new RegExp(`^/(${localePattern})/admin`).test(pathname)) return true;
  if (new RegExp(`^/(${localePattern})/(privacy|terms|returns)`).test(pathname)) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  if (isComingSoonActive()) {
    const pathname = request.nextUrl.pathname;
    if (!isComingSoonPathAllowed(pathname)) {
      const locale =
        routing.locales.find((code) => pathname === `/${code}` || pathname.startsWith(`/${code}/`)) ??
        routing.defaultLocale;
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}`;
      return NextResponse.redirect(url);
    }
  }

  const intlResponse = handleI18nRouting(request);
  return updateSupabaseSession(request, intlResponse);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
