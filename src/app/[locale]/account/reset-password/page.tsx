"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { shouldUseAuthMock } from "@/lib/auth/should-use-auth-mock";

export default function ResetPasswordPage() {
  const t = useTranslations("account.login");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(t("errors.weakPassword"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("errors.passwordMismatch"));
      return;
    }

    setLoading(true);
    try {
      if (!shouldUseAuthMock()) {
        const supabase = createSupabaseBrowserClient();
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) throw updateError;
      }
      router.push("/account");
    } catch {
      setError(t("errors.generic"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto flex min-h-screen w-full max-w-xl items-center px-5 py-24">
      <div className="w-full rounded-xl border border-outline-variant/20 p-8">
        <h1 className="mb-2 text-2xl font-medium text-primary">{t("resetPasswordTitle")}</h1>
        <p className="mb-8 text-sm text-secondary">{t("resetPasswordDescription")}</p>
        <form onSubmit={onSubmit} className="space-y-5">
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={t("createPassword")}
            className="w-full border border-outline-variant bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none"
          />
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder={t("confirmPassword")}
            className="w-full border border-outline-variant bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-4 text-xs font-semibold uppercase tracking-[0.15em] text-white disabled:opacity-60"
          >
            {loading ? t("submitting") : t("resetPasswordAction")}
          </button>
        </form>
        {error && <p className="mt-4 text-sm text-error">{error}</p>}
        <Link href="/account/login" className="mt-6 inline-block text-xs font-semibold uppercase tracking-[0.1em] text-primary underline underline-offset-4">
          {t("backToLogin")}
        </Link>
      </div>
    </main>
  );
}
