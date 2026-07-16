"use client";

import { useLocale, useTranslations } from "next-intl";
import { FormEvent, useId, useState } from "react";
import { Link } from "@/i18n/navigation";
import { LEGAL_PATHS } from "@/lib/legal-pages";
import type { NewsletterSource } from "@/lib/newsletter/types";

type NewsletterSignupFormProps = {
  source: NewsletterSource;
  variant?: "hero" | "cart";
  className?: string;
};

export function NewsletterSignupForm({
  source,
  variant = "hero",
  className = "",
}: NewsletterSignupFormProps) {
  const t = useTranslations("newsletter");
  const locale = useLocale();
  const emailId = useId();
  const consentId = useId();

  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const isHero = variant === "hero";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (status === "loading") return;

    if (!consent) {
      setStatus("error");
      setMessage(t("consentRequired"));
      return;
    }

    setStatus("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale, source, consent: true }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        alreadySubscribed?: boolean;
        pendingConfirmation?: boolean;
        error?: string;
      };

      if (!response.ok || !data.ok) {
        setStatus("error");
        if (data.error === "invalid_email") setMessage(t("invalidEmail"));
        else if (data.error === "consent_required") setMessage(t("consentRequired"));
        else setMessage(t("error"));
        return;
      }

      setStatus("success");
      if (data.pendingConfirmation) {
        setMessage(t("pendingConfirmation"));
      } else {
        setMessage(data.alreadySubscribed ? t("alreadySubscribed") : t("success"));
      }
      setEmail("");
      setConsent(false);
    } catch {
      setStatus("error");
      setMessage(t("error"));
    }
  }

  if (status === "success") {
    return (
      <p
        className={`text-sm font-medium ${isHero ? "text-on-primary" : "text-primary"} ${className}`}
        role="status"
      >
        {message ?? t("success")}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-3 ${className}`}>
      <div
        className={
          isHero
            ? "flex gap-0 border-b border-white/30 pb-2 transition-colors focus-within:border-white"
            : "relative"
        }
      >
        <label htmlFor={emailId} className="sr-only">
          {t("emailLabel")}
        </label>
        <input
          id={emailId}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={isHero ? t("placeholder") : t("emailLabel")}
          className={
            isHero
              ? "w-full border-none bg-transparent text-xs font-semibold uppercase tracking-[0.1em] placeholder:text-white/40 focus:ring-0"
              : "w-full border-b border-outline-variant bg-transparent py-2 pr-10 text-sm transition-colors focus:border-primary focus:outline-none"
          }
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className={
            isHero
              ? "shrink-0 px-4 text-xs font-semibold uppercase tracking-[0.1em] disabled:opacity-60"
              : "absolute bottom-2 right-0 disabled:opacity-60"
          }
          aria-label={t("subscribe")}
        >
          {isHero ? (
            status === "loading" ? t("submitting") : t("subscribe")
          ) : (
            <span className="material-symbols-outlined text-primary" aria-hidden>
              arrow_forward
            </span>
          )}
        </button>
      </div>

      <div className="flex items-start gap-2 text-left">
        <input
          id={consentId}
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-primary"
        />
        <label
          htmlFor={consentId}
          className={`text-[11px] leading-relaxed ${isHero ? "text-on-primary/80" : "text-secondary"}`}
        >
          {t("consent")}{" "}
          <Link
            href={LEGAL_PATHS.privacy}
            className={`underline underline-offset-2 ${isHero ? "text-on-primary" : "text-primary"}`}
          >
            {t("privacyLink")}
          </Link>
        </label>
      </div>

      {message && status === "error" && (
        <p
          className={`text-xs ${isHero ? "text-on-primary/90" : "text-red-700"}`}
          role="alert"
        >
          {message}
        </p>
      )}
    </form>
  );
}
