"use client";

import { FormEvent, useState } from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { hasSupabaseConfig } from "@/lib/env";

const ERRORS = {
  invalidCredentials: "Invalid email or password.",
  notAdmin: "This account does not have admin access. Use the store login for customers.",
  generic: "Something went wrong. Please try again.",
} as const;

export function AdminLoginForm() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const redirectTo = searchParams.get("redirect") || `/${locale}/admin`;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!hasSupabaseConfig()) {
      router.push(`/${locale}/admin`);
      return;
    }

    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        const message = signInError.message.toLowerCase();
        setError(
          message.includes("invalid login credentials")
            ? ERRORS.invalidCredentials
            : ERRORS.generic,
        );
        return;
      }

      if (!data.user) {
        setError(ERRORS.generic);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError || profile?.role !== "admin") {
        await supabase.auth.signOut();
        setError(ERRORS.notAdmin);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError(ERRORS.generic);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <label
          htmlFor="admin-email"
          className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant"
        >
          Staff email
        </label>
        <input
          id="admin-email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin@mbody.com"
          className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="admin-password"
          className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant"
        >
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary py-4 text-xs font-semibold uppercase tracking-[0.15em] text-on-primary transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign in to admin"}
      </button>

      {error && <p className="text-sm text-error">{error}</p>}

      <p className="text-center text-xs text-on-surface-variant">
        Store customer?{" "}
        <a href={`/${locale}/account/login`} className="font-semibold text-primary underline underline-offset-4">
          Use the shop login
        </a>
      </p>
    </form>
  );
}
