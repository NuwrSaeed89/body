"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useId, useState } from "react";
import { Link } from "@/i18n/navigation";
import { StarRatingDisplay } from "@/components/pdp/star-rating-display";
import { dispatchRatingUpdate } from "@/components/pdp/product-rating-header";
import type { ProductRatingState } from "@/lib/product-ratings/types";
import { useAuth } from "@/providers/auth-provider";

type ProductRatingsSectionProps = {
  slug: string;
};

type RatingsResponse = ProductRatingState & {
  ok?: boolean;
  error?: string;
  userRating?: number;
  summary?: ProductRatingState["summary"];
};

export function ProductRatingsSection({ slug }: ProductRatingsSectionProps) {
  const t = useTranslations("pdp.ratings");
  const { user, mounted, isAuthenticated } = useAuth();
  const groupId = useId();

  const [state, setState] = useState<ProductRatingState | null>(null);
  const [hoverStars, setHoverStars] = useState<number | null>(null);
  const [selectedStars, setSelectedStars] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const loadRatings = useCallback(async () => {
    const params = new URLSearchParams();
    if (user?.id) params.set("userId", user.id);

    try {
      const response = await fetch(
        `/api/products/${encodeURIComponent(slug)}/ratings?${params.toString()}`,
      );
      if (!response.ok) return;
      const data = (await response.json()) as RatingsResponse;
      setState({
        summary: data.summary,
        userRating: data.userRating,
        eligibility: data.eligibility,
      });
      if (data.userRating) {
        setSelectedStars(data.userRating);
      }
    } catch {
      /* keep previous state */
    }
  }, [slug, user?.id]);

  useEffect(() => {
    if (!mounted) return;
    loadRatings();
  }, [mounted, loadRatings]);

  useEffect(() => {
    const onAuthChange = () => loadRatings();
    window.addEventListener("mbody-auth-change", onAuthChange);
    return () => window.removeEventListener("mbody-auth-change", onAuthChange);
  }, [loadRatings]);

  async function handleSubmit() {
    if (!selectedStars || !user?.id || status === "loading") return;
    if (!state?.eligibility.canRate) return;

    setStatus("loading");
    setMessage(null);

    try {
      const response = await fetch(`/api/products/${encodeURIComponent(slug)}/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stars: selectedStars, userId: user.id }),
      });

      const data = (await response.json()) as RatingsResponse & {
        error?: string;
      };

      if (!response.ok) {
        setStatus("error");
        setMessage(
          data.error === "not_purchased"
            ? t("notPurchased")
            : data.error === "not_signed_in"
              ? t("signInRequired")
              : data.error === "already_rated"
                ? t("alreadyRated")
                : t("error"),
        );
        if (data.summary) {
          setState((prev) =>
            prev
              ? {
                  ...prev,
                  summary: data.summary!,
                  userRating: data.userRating ?? prev.userRating,
                  eligibility: { canRate: false, reason: "already_rated" },
                }
              : prev,
          );
        }
        return;
      }

      setState({
        summary: data.summary!,
        userRating: data.userRating ?? selectedStars,
        eligibility: { canRate: false, reason: "already_rated" },
      });
      dispatchRatingUpdate(slug, data.summary!);
      setStatus("success");
      setMessage(t("success"));
    } catch {
      setStatus("error");
      setMessage(t("error"));
    }
  }

  if (!state) {
    return (
      <div className="h-24 animate-pulse rounded-lg bg-surface-container-low" aria-hidden />
    );
  }

  const { summary, userRating, eligibility } = state;
  const activeStars = hoverStars ?? selectedStars ?? userRating ?? 0;
  const showForm =
    mounted && isAuthenticated && eligibility.canRate && userRating == null;
  const showThanks = userRating != null || status === "success";

  return (
    <section
      className="rounded-lg border border-outline-variant/30 bg-surface-container-low px-4 py-4"
      aria-labelledby={`${groupId}-title`}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            id={`${groupId}-title`}
            className="text-xs font-semibold uppercase tracking-[0.1em] text-primary"
          >
            {t("title")}
          </h2>
          <div className="mt-1 flex items-center gap-2">
            <StarRatingDisplay average={summary.average} size="md" />
            <p className="text-sm text-secondary">
              {t("summary", {
                average: summary.average.toFixed(1),
                count: summary.count,
              })}
            </p>
          </div>
        </div>
      </div>

      {showThanks && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-secondary" role="status">
            {message ?? t("yourRating", { stars: userRating ?? selectedStars ?? 0 })}
          </p>
          <StarRatingDisplay average={userRating ?? selectedStars ?? 0} size="md" />
        </div>
      )}

      {!mounted && <p className="text-sm text-secondary">{t("loading")}</p>}

      {mounted && !isAuthenticated && (
        <p className="text-sm text-secondary">
          {t("signInRequired")}{" "}
          <Link href="/account/login" className="font-semibold text-primary underline underline-offset-2">
            {t("signInCta")}
          </Link>
        </p>
      )}

      {mounted && isAuthenticated && !eligibility.canRate && !showThanks && (
        <p className="text-sm text-secondary">
          {eligibility.reason === "not_purchased" ? t("notPurchased") : t("alreadyRated")}
        </p>
      )}

      {showForm && (
        <div className="mt-2 flex flex-col gap-3">
          <p className="text-sm text-secondary">{t("prompt")}</p>
          <div
            className="flex items-center gap-1"
            role="radiogroup"
            aria-label={t("selectStars")}
            onMouseLeave={() => setHoverStars(null)}
          >
            {Array.from({ length: 5 }).map((_, index) => {
              const value = index + 1;
              const filled = value <= activeStars;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={selectedStars === value}
                  aria-label={t("starLabel", { value })}
                  className="rounded p-0.5 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  onMouseEnter={() => setHoverStars(value)}
                  onClick={() => setSelectedStars(value)}
                >
                  <span
                    className="material-symbols-outlined text-[28px] text-primary"
                    style={{ fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    star
                  </span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            disabled={!selectedStars || status === "loading"}
            onClick={handleSubmit}
            className="w-fit bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {status === "loading" ? t("submitting") : t("submit")}
          </button>
          {message && status === "error" && (
            <p className="text-xs text-red-700" role="alert">
              {message}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
