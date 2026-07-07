import { NextResponse } from "next/server";
import { resolveAuthRedirectPath } from "@/lib/auth/resolve-auth-redirect";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { shouldUseAuthMock } from "@/lib/auth/should-use-auth-mock";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const redirectPath = resolveAuthRedirectPath(
    url.searchParams.get("redirect") ?? "/",
  );

  if (!shouldUseAuthMock() && code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[auth/callback] exchangeCodeForSession failed:", error.message);
    }
  }

  const redirectUrl = new URL(redirectPath, url.origin);
  return NextResponse.redirect(redirectUrl);
}
