"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type AuthView = "login" | "register";

function UnderlineField({
  id,
  label,
  type = "text",
  placeholder,
  labelExtra,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  labelExtra?: ReactNode;
}) {
  return (
    <div className="input-underline border-b border-outline-variant/50">
      <div className="flex items-end justify-between">
        <label
          htmlFor={id}
          className="text-[10px] font-semibold uppercase tracking-widest text-secondary"
        >
          {label}
        </label>
        {labelExtra}
      </div>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className="w-full border-none bg-transparent px-0 py-3 text-base text-primary placeholder:text-outline-variant/60 focus:ring-0"
      />
    </div>
  );
}

export function AuthForms() {
  const t = useTranslations("account.login");
  const [view, setView] = useState<AuthView>("login");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onMove = (e: MouseEvent) => {
      const x = (window.innerWidth / 2 - e.pageX) / 100;
      const y = (window.innerHeight / 2 - e.pageY) / 100;
      container.style.transform = `translate(${x}px, ${y}px)`;
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const isLogin = view === "login";

  return (
    <div className="flex flex-1 items-center justify-center bg-surface px-5 py-24 md:px-16 md:py-20">
      <div className="w-full max-w-md">
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

            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-6">
                <UnderlineField
                  id="login-email"
                  label={t("email")}
                  type="email"
                  placeholder="name@example.com"
                />
                <UnderlineField
                  id="login-password"
                  label={t("password")}
                  type="password"
                  placeholder="••••••••"
                  labelExtra={
                    <Link
                      href="#"
                      className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-secondary transition-colors hover:text-primary"
                    >
                      {t("forgotPassword")}
                    </Link>
                  }
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-primary py-5 text-xs font-semibold uppercase tracking-widest text-on-primary shadow-[0_10px_20px_rgba(0,0,0,0.1)] transition-all hover:bg-primary/90 active:scale-[0.98]"
              >
                {t("logIn")}
              </button>

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

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-4">
                <UnderlineField
                  id="reg-first"
                  label={t("firstName")}
                  placeholder="Jane"
                />
                <UnderlineField
                  id="reg-last"
                  label={t("lastName")}
                  placeholder="Doe"
                />
              </div>
              <UnderlineField
                id="reg-email"
                label={t("email")}
                type="email"
                placeholder="name@example.com"
              />
              <UnderlineField
                id="reg-password"
                label={t("createPassword")}
                type="password"
                placeholder={t("passwordHint")}
              />

              <div className="flex items-start gap-3 py-2">
                <input
                  id="terms"
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
                />
                <label htmlFor="terms" className="text-sm leading-tight text-secondary">
                  {t("termsAgreement")}{" "}
                  <Link href="#" className="underline">
                    {t("terms")}
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-primary py-5 text-xs font-semibold uppercase tracking-widest text-on-primary shadow-[0_10px_20px_rgba(0,0,0,0.1)] transition-all hover:bg-primary/90 active:scale-[0.98]"
              >
                {t("becomeMember")}
              </button>

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

        <div className="mt-16 flex items-center justify-center gap-8 opacity-40 grayscale transition-all duration-700 hover:grayscale-0 hover:opacity-100">
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
