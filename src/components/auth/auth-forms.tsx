"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import { LEGAL_PATHS } from "@/lib/legal-pages";
import { useAuth } from "@/providers/auth-provider";

type AuthView = "login" | "register";

function UnderlineField({
  id,
  name,
  label,
  type = "text",
  placeholder,
  labelExtra,
}: {
  id: string;
  name?: string;
  label: string;
  type?: string;
  placeholder?: string;
  labelExtra?: ReactNode;
}) {
  return (
    <div className="input-underline border-b border-outline-variant/50">
      {labelExtra ? (
        <div className="flex items-end justify-between">
          <label
            htmlFor={id}
            className="text-[10px] font-semibold uppercase tracking-widest text-secondary"
          >
            {label}
          </label>
          {labelExtra}
        </div>
      ) : (
        <label
          htmlFor={id}
          className="text-[10px] font-semibold uppercase tracking-widest text-secondary"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        name={name ?? id}
        type={type}
        placeholder={placeholder}
        className="w-full border-none bg-transparent px-0 py-3 text-base text-primary placeholder:text-outline-variant/60 focus:ring-0"
      />
    </div>
  );
}

export function AuthForms() {
  const t = useTranslations("account.login");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signUp } = useAuth();
  const [view, setView] = useState<AuthView>("login");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const redirectTo = searchParams.get("redirect") || "/account";

  const resolveAuthError = (message: string): string => {
    const normalized = message.toLowerCase();
    if (normalized.includes("invalid login credentials")) return t("errors.invalidCredentials");
    if (normalized.includes("email not confirmed")) return t("errors.emailNotConfirmed");
    if (normalized.includes("already registered")) return t("errors.emailInUse");
    if (normalized.includes("password should be at least")) return t("errors.weakPassword");
    return t("errors.generic");
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (!email || !password) {
      setError(t("errors.invalidCredentials"));
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn(email, password);
      router.push(redirectTo);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "";
      setError(resolveAuthError(message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const acceptedTerms = form.get("terms") === "on";

    if (!acceptedTerms) {
      setError(t("errors.termsRequired"));
      return;
    }
    if (!email || !password) {
      setError(t("errors.generic"));
      return;
    }

    setIsSubmitting(true);
    try {
      const { sessionCreated } = await signUp({
        email,
        password,
        firstName: String(form.get("firstName") ?? "").trim() || undefined,
        lastName: String(form.get("lastName") ?? "").trim() || undefined,
      });
      if (sessionCreated) {
        router.push(redirectTo);
        return;
      }
      setSuccess(t("checkEmail"));
      setView("login");
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "";
      setError(resolveAuthError(message));
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onMove = (e: MouseEvent) => {
      const x = (window.innerWidth / 2 - e.pageX) / 100;
      const y = (window.innerHeight / 2 - e.pageY) / 100;
      container.style.transform = `translateX(${x}px) translateY(${y}px)`;
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const isLogin = view === "login";

  return (
    <div className="flex flex-1 items-center justify-center bg-surface px-5 py-20 md:px-16">
      <div className="w-full max-w-md">
        <div className="mb-16">
          <Link
            href="/"
            className="text-2xl font-extrabold tracking-tighter text-primary"
          >
            Mbody
          </Link>
        </div>

        <div ref={containerRef} className="relative auth-form-transition">
          {/* Login */}
          <div
            className={`auth-form-transition ${
              isLogin
                ? "relative translate-x-0 opacity-100"
                : "pointer-events-none absolute top-0 w-full -translate-x-12 opacity-0"
            }`}
            aria-hidden={!isLogin}
          >
            <div className="mb-10">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-on-primary-container">
                {t("welcomeBack")}
              </span>
              <h1 className="text-3xl font-medium tracking-tight text-primary md:text-2xl md:leading-tight">
                {t("signInTitle")}
              </h1>
            </div>

            <form className="space-y-8" onSubmit={handleLogin}>
              <div className="space-y-6">
                <UnderlineField
                  id="login-email"
                  name="email"
                  label={t("email")}
                  type="email"
                  placeholder="name@example.com"
                />
                <UnderlineField
                  id="login-password"
                  name="password"
                  label={t("password")}
                  type="password"
                  placeholder="••••••••"
                  labelExtra={
                    <Link
                      href="/account/forgot-password"
                      className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-secondary transition-colors hover:text-primary"
                    >
                      {t("forgotPassword")}
                    </Link>
                  }
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-primary py-5 text-xs font-semibold uppercase tracking-widest text-on-primary shadow-[0_10px_20px_rgba(0,0,0,0.1)] transition-all hover:bg-primary/90 active:scale-[0.98]"
              >
                {isSubmitting ? t("submitting") : t("logIn")}
              </button>
              {error && <p className="text-sm text-error">{error}</p>}
              {success && <p className="text-sm text-primary">{success}</p>}

              <div className="pt-8 text-center">
                <p className="text-sm text-secondary">
                  {t("newToCollective")}{" "}
                  <button
                    type="button"
                    onClick={() => setView("register")}
                    className="font-semibold text-primary underline decoration-1 underline-offset-4 transition-all hover:decoration-2"
                  >
                    {t("createAccountLink")}
                  </button>
                </p>
              </div>
            </form>
          </div>

          {/* Register */}
          <div
            className={`auth-form-transition ${
              isLogin
                ? "pointer-events-none absolute top-0 w-full translate-x-12 opacity-0"
                : "relative translate-x-0 opacity-100"
            }`}
            aria-hidden={isLogin}
          >
            <div className="mb-10">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-on-primary-container">
                {t("exclusivityAwaits")}
              </span>
              <h1 className="text-3xl font-medium tracking-tight text-primary md:text-2xl md:leading-tight">
                {t("joinTitle")}
              </h1>
            </div>

            <form className="space-y-6" onSubmit={handleRegister}>
              <div className="grid grid-cols-2 gap-4">
                <UnderlineField
                  id="reg-first"
                  name="firstName"
                  label={t("firstName")}
                  placeholder="Jane"
                />
                <UnderlineField
                  id="reg-last"
                  name="lastName"
                  label={t("lastName")}
                  placeholder="Doe"
                />
              </div>
              <UnderlineField
                id="reg-email"
                name="email"
                label={t("email")}
                type="email"
                placeholder="name@example.com"
              />
              <UnderlineField
                id="reg-password"
                name="password"
                label={t("createPassword")}
                type="password"
                placeholder={t("passwordHint")}
              />

              <div className="flex items-start gap-3 py-2">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
                />
                <label htmlFor="terms" className="text-sm leading-tight text-secondary">
                  {t("termsAgreement")}{" "}
                  <Link href={LEGAL_PATHS.terms} className="underline">
                    {t("terms")}
                  </Link>
                  {" · "}
                  <Link href={LEGAL_PATHS.privacy} className="underline">
                    {t("privacy")}
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-primary py-5 text-xs font-semibold uppercase tracking-widest text-on-primary shadow-[0_10px_20px_rgba(0,0,0,0.1)] transition-all hover:bg-primary/90 active:scale-[0.98]"
              >
                {isSubmitting ? t("submitting") : t("becomeMember")}
              </button>
              {error && <p className="text-sm text-error">{error}</p>}
              {success && <p className="text-sm text-primary">{success}</p>}

              <div className="pt-8 text-center">
                <p className="text-sm text-secondary">
                  {t("alreadyMember")}{" "}
                  <button
                    type="button"
                    onClick={() => setView("login")}
                    className="font-semibold text-primary underline decoration-1 underline-offset-4 transition-all hover:decoration-2"
                  >
                    {t("signInLink")}
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>

        <div className="group mt-16 flex items-center justify-center gap-8 opacity-40 grayscale transition-all duration-700 hover:grayscale-0 hover:opacity-100">
          {[t("trustEncrypted"), t("trustSecure"), t("trustPrivacy")].map(
            (label) => (
              <span
                key={label}
                className="text-[10px] font-semibold uppercase tracking-widest"
              >
                {label}
              </span>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
