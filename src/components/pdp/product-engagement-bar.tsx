"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  formatEngagementCount,
  getOrCreateBrowserSessionId,
  hasRecordedPdpView,
  markPdpViewRecorded,
  type ProductStats,
} from "@/lib/product-stats";
import { LIKE_COUNT_UPDATE_EVENT } from "@/lib/wishlist-storage";

type ProductEngagementBarProps = {
  productId: string;
  slug: string;
  initialStats: ProductStats;
};

type LikeCountUpdateDetail = {
  productId?: string;
  likeCount?: number;
  delta?: number;
};

export function ProductEngagementBar({
  productId,
  slug,
  initialStats,
}: ProductEngagementBarProps) {
  const t = useTranslations("pdp.engagement");
  const [stats, setStats] = useState(initialStats);

  useEffect(() => {
    setStats(initialStats);
  }, [initialStats, productId]);

  useEffect(() => {
    if (hasRecordedPdpView(slug)) return;

    const sessionId = getOrCreateBrowserSessionId();
    if (!sessionId) return;

    const controller = new AbortController();

    fetch(`/api/products/${encodeURIComponent(slug)}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then(
        (data: {
          viewCount?: number;
          waitingCount?: number;
          likeCount?: number;
        } | null) => {
          if (
            data?.viewCount != null ||
            data?.waitingCount != null ||
            data?.likeCount != null
          ) {
            setStats((prev) => ({
              ...prev,
              ...(data.viewCount != null ? { viewCount: data.viewCount } : {}),
              ...(data.waitingCount != null
                ? { waitingCount: data.waitingCount }
                : {}),
              ...(data.likeCount != null ? { likeCount: data.likeCount } : {}),
            }));
          }
          markPdpViewRecorded(slug);
        },
      )
      .catch(() => {
        /* non-blocking — keep seeded stats */
      });

    return () => controller.abort();
  }, [slug]);

  useEffect(() => {
    const onWaitingUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{ slug?: string; waitingCount?: number }>).detail;
      if (detail?.slug === slug && typeof detail.waitingCount === "number") {
        setStats((prev) => ({ ...prev, waitingCount: detail.waitingCount! }));
      }
    };
    window.addEventListener("mbody-waiting-count-update", onWaitingUpdate);
    return () => window.removeEventListener("mbody-waiting-count-update", onWaitingUpdate);
  }, [slug]);

  useEffect(() => {
    const onLikeUpdate = (event: Event) => {
      const detail = (event as CustomEvent<LikeCountUpdateDetail>).detail;
      if (!detail || detail.productId !== productId) return;

      setStats((prev) => {
        if (typeof detail.likeCount === "number") {
          return { ...prev, likeCount: Math.max(0, detail.likeCount) };
        }
        if (typeof detail.delta === "number") {
          return {
            ...prev,
            likeCount: Math.max(0, prev.likeCount + detail.delta),
          };
        }
        return prev;
      });
    };
    window.addEventListener(LIKE_COUNT_UPDATE_EVENT, onLikeUpdate);
    return () => window.removeEventListener(LIKE_COUNT_UPDATE_EVENT, onLikeUpdate);
  }, [productId]);

  const items = [
    {
      icon: "visibility",
      label: t("views", { count: formatEngagementCount(stats.viewCount) }),
    },
    {
      icon: "favorite",
      label: t("likes", { count: formatEngagementCount(stats.likeCount) }),
    },
    {
      icon: "notifications",
      label: t("waiting", { count: formatEngagementCount(stats.waitingCount) }),
    },
    {
      icon: "local_shipping",
      label: t("sold", { count: formatEngagementCount(stats.unitsSold) }),
    },
  ];

  return (
    <div
      className="grid grid-cols-2 gap-2 sm:grid-cols-4"
      role="group"
      aria-label={t("groupLabel")}
    >
      {items.map((item) => (
        <div
          key={item.icon}
          className="flex items-center gap-2 rounded-lg bg-surface-container-low px-3 py-2"
        >
          <span className="material-symbols-outlined text-[18px] text-secondary" aria-hidden>
            {item.icon}
          </span>
          <p className="text-xs font-medium text-secondary">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
