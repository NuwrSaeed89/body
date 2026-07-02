"use client";

import { useTranslations } from "next-intl";
import { FormEvent, useEffect, useId, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import {
  dispatchWaitingCountUpdate,
  hasClientStockNotifySubscription,
  markClientStockNotifySubscription,
} from "@/lib/waiting-list/client-storage";
import { buildVariantKey } from "@/lib/waiting-list/variant-key";

type NotifyWhenBackFormProps = {
  productId: string;
  slug: string;
  size?: string | null;
  color?: string | null;
  variantId?: string | null;
  variant?: "compact" | "panel";
  className?: string;
};

export function NotifyWhenBackForm({
  productId,
  slug,
  size = null,
  color = null,
  variantId: variantIdProp = null,
  variant = "panel",
  className = "",
}: NotifyWhenBackFormProps) {
  const t = useTranslations("stockNotify");
  const { user } = useAuth();
  const emailId = useId();
  const variantId =
    variantIdProp?.trim() ||
    buildVariantKey({ productId, size, color });

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user?.email]);

  useEffect(() => {
    setSubscribed(hasClientStockNotifySubscription(productId, variantId));
  }, [productId, variantId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (subscribed || status === "loading") return;

    setStatus("loading");
    setMessage(null);

    try {
      const response = await fetch(`/api/products/${encodeURIComponent(slug)}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          size,
          color,
          variantId,
          userId: user?.id ?? null,
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        alreadySubscribed?: boolean;
        waitingCount?: number;
        error?: string;
      };

      if (!response.ok || !data.ok) {
        setStatus("error");
        setMessage(data.error === "invalid_email" ? t("invalidEmail") : t("error"));
        return;
      }

      markClientStockNotifySubscription(productId, variantId);
      setSubscribed(true);
      setStatus("success");
      setMessage(data.alreadySubscribed ? t("alreadySubscribed") : t("success"));

      if (typeof data.waitingCount === "number") {
        dispatchWaitingCountUpdate(slug, data.waitingCount);
      }
    } catch {
      setStatus("error");
      setMessage(t("error"));
    }
  }

  const isCompact = variant === "compact";

  if (subscribed) {
    return (
      <p
        className={`text-xs font-medium text-secondary ${className}`}
        role="status"
      >
        {message ?? t("success")}
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`${isCompact ? "flex flex-col gap-2" : "flex flex-col gap-3"} ${className}`}
    >
      {!isCompact && (
        <p className="text-sm text-secondary">{t("description")}</p>
      )}
      <label htmlFor={emailId} className="sr-only">
        {t("emailLabel")}
      </label>
      <div className={isCompact ? "flex flex-col gap-2 sm:flex-row" : "flex flex-col gap-2"}>
        <input
          id={emailId}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("emailPlaceholder")}
          className={`w-full border border-outline-variant bg-transparent px-3 py-2.5 text-sm focus:border-primary focus:outline-none ${
            isCompact ? "rounded-full" : ""
          }`}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className={`shrink-0 bg-primary text-on-primary font-semibold uppercase tracking-[0.1em] transition-opacity hover:opacity-90 disabled:opacity-60 ${
            isCompact
              ? "rounded-full px-4 py-2.5 text-[10px]"
              : "px-4 py-3 text-xs"
          }`}
        >
          {status === "loading" ? t("submitting") : t("submit")}
        </button>
      </div>
      {message && status === "error" && (
        <p className="text-xs text-red-700" role="alert">
          {message}
        </p>
      )}
      {(size || color) && !isCompact && (
        <p className="text-[11px] text-secondary">
          {t("variantHint", {
            size: size ?? "—",
            color: color ?? "—",
          })}
        </p>
      )}
    </form>
  );
}
