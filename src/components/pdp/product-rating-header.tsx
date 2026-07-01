"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { StarRatingDisplay } from "@/components/pdp/star-rating-display";
import type { ProductRatingSummary } from "@/lib/product-ratings/types";

type ProductRatingHeaderProps = {
  slug: string;
  initialSummary?: ProductRatingSummary;
};

export function ProductRatingHeader({ slug, initialSummary }: ProductRatingHeaderProps) {
  const t = useTranslations("pdp.ratings");
  const [summary, setSummary] = useState<ProductRatingSummary | null>(initialSummary ?? null);

  const loadSummary = useCallback(async () => {
    try {
      const response = await fetch(`/api/products/${encodeURIComponent(slug)}/ratings`);
      if (!response.ok) return;
      const data = (await response.json()) as { summary: ProductRatingSummary };
      setSummary(data.summary);
    } catch {
      /* keep initial */
    }
  }, [slug]);

  useEffect(() => {
    if (!initialSummary) loadSummary();
  }, [initialSummary, loadSummary]);

  useEffect(() => {
    const onUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{ slug?: string; summary?: ProductRatingSummary }>).detail;
      if (detail?.slug === slug && detail.summary) {
        setSummary(detail.summary);
      }
    };
    window.addEventListener("mbody-rating-update", onUpdate);
    return () => window.removeEventListener("mbody-rating-update", onUpdate);
  }, [slug]);

  if (!summary) {
    return <div className="h-8 w-20 animate-pulse rounded bg-surface-container-low" aria-hidden />;
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-0.5">
      <StarRatingDisplay average={summary.average} />
      <p className="text-[10px] font-medium text-secondary">
        {t("summary", {
          average: summary.average.toFixed(1),
          count: summary.count,
        })}
      </p>
    </div>
  );
}

function dispatchRatingUpdate(slug: string, summary: ProductRatingSummary) {
  window.dispatchEvent(
    new CustomEvent("mbody-rating-update", { detail: { slug, summary } }),
  );
}

export { dispatchRatingUpdate };
