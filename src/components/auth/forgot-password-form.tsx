"use client";

import { FormEvent, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AuthUnderlineField } from "@/components/auth/auth-underline-field";
import { resolveAuthRedirectPath } from "@/lib/auth/resolve-auth-redirect";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { shouldUseAuthMock } from "@/lib/auth/should-use-auth-mock";

export function ForgotPasswordForm() {
  const t = useTranslations("account.login");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setStatus("idle");
    try {
      if (!shouldUseAuthMock()) {
        const supabase = createSupabaseBrowserClient();
        const redirectTo = `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(
          resolveAuthRedirectPath(`/${locale}/account/reset-password`),
        )}`;
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo,
        });
        if (error) throw error;
      }
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <AuthUnderlineField
        id="forgot-email"
        label={t("email")}
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="name@example.com"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary py-5 text-xs font-semibold uppercase tracking-widest text-on-primary shadow-[0_10px_20px_rgba(0,0,0,0.1)] transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60"
      >
        {loading ? t("submitting") : t("forgotPasswordAction")}
      </button>
      {status === "success" && <p className="text-sm text-primary">{t("forgotPasswordSent")}</p>}
      {status === "error" && <p className="text-sm text-error">{t("errors.generic")}</p>}
    </form>
  );
}
