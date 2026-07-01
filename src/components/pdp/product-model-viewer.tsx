"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

type ProductModelViewerProps = {
  src: string;
  alt: string;
  poster?: string;
  className?: string;
};

export function ProductModelViewer({
  src,
  alt,
  poster,
  className = "",
}: ProductModelViewerProps) {
  const t = useTranslations("pdp.viewer");
  const viewerRef = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    import("@google/model-viewer")
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const el = viewerRef.current;
    if (!el || !ready) return;

    const onError = () => setError(true);
    el.addEventListener("error", onError);
    return () => el.removeEventListener("error", onError);
  }, [ready]);

  if (error) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-3 bg-surface-container-low p-8 text-center ${className}`}
        role="alert"
      >
        <span className="material-symbols-outlined text-5xl text-outline-variant">
          error
        </span>
        <p className="text-sm text-secondary">{t("error")}</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {!ready && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-surface-container-low"
          aria-live="polite"
          aria-busy="true"
        >
          <span className="material-symbols-outlined animate-spin text-4xl text-secondary">
            progress_activity
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-secondary">
            {t("loading")}
          </p>
        </div>
      )}

      {ready && (
        <model-viewer
          ref={viewerRef}
          src={src}
          alt={alt}
          poster={poster}
          loading="lazy"
          reveal="interaction"
          camera-controls
          touch-action="pan-y"
          shadow-intensity="1"
          exposure="1"
          interaction-prompt="auto"
          ar
          ar-modes="webxr scene-viewer quick-look"
          className="product-model-viewer"
        />
      )}

      {ready && (
        <p className="pointer-events-none absolute bottom-4 left-1/2 z-10 hidden max-w-[90%] -translate-x-1/2 rounded-lg bg-primary/80 px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-white md:block">
          {t("hint")}
        </p>
      )}
    </div>
  );
}
