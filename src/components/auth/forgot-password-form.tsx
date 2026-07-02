"use client";

import { FormEvent, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
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
    <form onSubmit={onSubmit} className="space-y-5">
      <label htmlFor="forgot-email" className="text-xs font-semibold uppercase tracking-[0.1em] text-secondary">
        {t("email")}
      </label>
      <input
        id="forgot-email"
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="name@example.com"
        className="w-full border border-outline-variant bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary py-4 text-xs font-semibold uppercase tracking-[0.15em] text-white disabled:opacity-60"
      >
        {loading ? t("submitting") : t("forgotPasswordAction")}
      </button>
      {status === "success" && <p className="text-sm text-primary">{t("forgotPasswordSent")}</p>}
      {status === "error" && <p className="text-sm text-error">{t("errors.generic")}</p>}
    </form>
  );
}
