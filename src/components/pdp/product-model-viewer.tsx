"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

type ProductModelViewerProps = {
  src: string;
  alt: string;
  poster?: string;
  className?: string;
};

/**
 * Lazy GLB viewer: mounts model-viewer only when near viewport,
 * then loads the @google/model-viewer chunk + asset on demand (CWV-friendly).
 */
export function ProductModelViewer({
  src,
  alt,
  poster,
  className = "",
}: ProductModelViewerProps) {
  const t = useTranslations("pdp.viewer");
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [moduleReady, setModuleReady] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px", threshold: 0.01 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;

    let cancelled = false;

    import("@google/model-viewer")
      .then(() => {
        if (!cancelled) setModuleReady(true);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [inView]);

  useEffect(() => {
    setModelLoaded(false);
    setError(false);
  }, [src]);

  useEffect(() => {
    const el = viewerRef.current;
    if (!el || !moduleReady) return;

    const onLoad = () => setModelLoaded(true);
    const onError = () => setError(true);

    el.addEventListener("load", onLoad);
    el.addEventListener("error", onError);

    return () => {
      el.removeEventListener("load", onLoad);
      el.removeEventListener("error", onError);
    };
  }, [moduleReady, src]);

  const isLoading = !inView || !moduleReady || !modelLoaded;

  if (error) {
    return (
      <div
        ref={containerRef}
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
    <div ref={containerRef} className={`relative ${className}`}>
      {isLoading && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-surface-container-low"
          aria-live="polite"
          aria-busy="true"
        >
          {poster ? (
            // eslint-disable-next-line @next/next/no-img-element -- lightweight poster before model-viewer mounts
            <img
              src={poster}
              alt=""
              className="absolute inset-0 size-full object-cover opacity-40"
              loading="lazy"
              decoding="async"
            />
          ) : null}
          <span className="material-symbols-outlined relative z-[1] animate-spin text-4xl text-secondary">
            progress_activity
          </span>
          <p className="relative z-[1] text-xs font-semibold uppercase tracking-[0.1em] text-secondary">
            {t("loading")}
          </p>
        </div>
      )}

      {moduleReady && (
        <model-viewer
          ref={viewerRef}
          src={src}
          alt={alt}
          poster={poster}
          loading="lazy"
          reveal="auto"
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

      {moduleReady && modelLoaded && (
        <p className="pointer-events-none absolute bottom-4 left-1/2 z-10 hidden max-w-[90%] -translate-x-1/2 rounded-lg bg-primary/80 px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-white md:block">
          {t("hint")}
        </p>
      )}
    </div>
  );
}
