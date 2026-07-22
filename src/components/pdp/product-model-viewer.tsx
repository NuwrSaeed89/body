"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { resolveModelViewerSrc } from "@/lib/pdp/resolve-model-src";
import {
  applyViewerLighting,
  resolveViewerLighting,
  VIEWER_LIGHTING_DEFAULTS,
  VIEWER_LIGHTING_RANGES,
  type ViewerLightingConfig,
} from "@/lib/pdp/viewer-lighting";

type ModelViewerElement = HTMLElement & {
  exposure: number;
  shadowIntensity: number;
  shadowSoftness: number;
  environmentImage: string | null;
  loaded?: boolean;
};

type ProductModelViewerProps = {
  src: string;
  alt: string;
  poster?: string;
  className?: string;
  /** Full-screen scan mode — free orbit gestures, no page scroll steal. */
  fullscreen?: boolean;
  /** When set, shows a Fullscreen action in the bottom toolbar (inline viewer only). */
  onFullscreen?: () => void;
  /** Optional overrides — also tunable via CSS vars on `.product-model-viewer`. */
  lighting?: Partial<ViewerLightingConfig>;
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
  fullscreen = false,
  onFullscreen,
  lighting: lightingOverrides,
}: ProductModelViewerProps) {
  const t = useTranslations("pdp.viewer");
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<ModelViewerElement | null>(null);
  const [inView, setInView] = useState(false);
  const [moduleReady, setModuleReady] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [error, setError] = useState(false);

  const baseLighting = useMemo(
    () => resolveViewerLighting(null, lightingOverrides),
    [lightingOverrides],
  );

  const [environmentIntensity, setEnvironmentIntensity] = useState(
    baseLighting.environmentIntensity,
  );
  const [shadowAngleDeg, setShadowAngleDeg] = useState(
    baseLighting.shadowAngleDeg,
  );

  const lightingRef = useRef({
    ...baseLighting,
    environmentIntensity,
    shadowAngleDeg,
  });
  lightingRef.current = {
    ...baseLighting,
    environmentIntensity,
    shadowAngleDeg,
  };

  const modelSrc = useMemo(() => resolveModelViewerSrc(src), [src]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (fullscreen) {
      setInView(true);
      return;
    }

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
  }, [fullscreen]);

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
    const next = resolveViewerLighting(containerRef.current, lightingOverrides);
    setEnvironmentIntensity(next.environmentIntensity);
    setShadowAngleDeg(next.shadowAngleDeg);
  }, [modelSrc, lightingOverrides]);

  const syncLighting = () => {
    const el = viewerRef.current;
    if (!el || !moduleReady) return;
    const fromCss = resolveViewerLighting(containerRef.current, lightingOverrides);
    applyViewerLighting(el, {
      ...fromCss,
      environmentIntensity: lightingRef.current.environmentIntensity,
      shadowAngleDeg: lightingRef.current.shadowAngleDeg,
    });
  };

  useEffect(() => {
    const el = viewerRef.current;
    if (!el || !moduleReady) return;

    const onLoad = () => {
      syncLighting();
      setModelLoaded(true);
    };
    const onError = () => setError(true);

    el.addEventListener("load", onLoad);
    el.addEventListener("error", onError);

    if (el.loaded) {
      syncLighting();
      setModelLoaded(true);
    }

    return () => {
      el.removeEventListener("load", onLoad);
      el.removeEventListener("error", onError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync on mount/src only
  }, [moduleReady, modelSrc]);

  useEffect(() => {
    syncLighting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environmentIntensity, shadowAngleDeg, moduleReady, modelLoaded]);

  const isLoading = !inView || !moduleReady || !modelLoaded;
  const showToolbar = moduleReady;
  const envRange = VIEWER_LIGHTING_RANGES.environmentIntensity;
  const angleRange = VIEWER_LIGHTING_RANGES.shadowAngleDeg;

  const envLabel = t.has("environmentLight")
    ? t("environmentLight")
    : "Background light intensity";
  const shadowAngleLabel = t.has("shadowAngle")
    ? t("shadowAngle")
    : "Shadow angle";

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
    <div ref={containerRef} className={`product-model-viewer-host relative ${className}`}>
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
          src={modelSrc}
          alt={alt}
          poster={poster}
          loading="lazy"
          reveal="auto"
          camera-controls
          touch-action={fullscreen ? "none" : "pan-y"}
          environment-image={VIEWER_LIGHTING_DEFAULTS.environmentImage}
          shadow-intensity={String(VIEWER_LIGHTING_DEFAULTS.shadowIntensity)}
          shadow-softness={String(VIEWER_LIGHTING_DEFAULTS.shadowSoftness)}
          exposure={String(VIEWER_LIGHTING_DEFAULTS.environmentIntensity)}
          interaction-prompt="auto"
          ar
          ar-modes="webxr scene-viewer quick-look"
          className={`product-model-viewer ${fullscreen ? "product-model-viewer--fullscreen" : ""}`}
        />
      )}

      {showToolbar && (
        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-30 sm:inset-x-4 sm:bottom-4">
          <div className="pointer-events-auto mx-auto flex max-w-2xl flex-wrap items-center gap-2 rounded-xl bg-primary/90 px-2.5 py-2 text-white shadow-xl sm:gap-3 sm:px-3">
            <div className="flex shrink-0 items-center gap-2">
              <span
                className="material-symbols-outlined text-[18px]"
                aria-hidden
              >
                wb_twilight
              </span>
              <input
                type="range"
                min={envRange.min}
                max={envRange.max}
                step={envRange.step}
                value={environmentIntensity}
                onInput={(event) =>
                  setEnvironmentIntensity(
                    Number((event.target as HTMLInputElement).value),
                  )
                }
                disabled={!modelLoaded}
                className="h-1.5 w-14 cursor-pointer accent-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-20"
                aria-label={envLabel}
                aria-valuemin={envRange.min}
                aria-valuemax={envRange.max}
                aria-valuenow={environmentIntensity}
              />
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span
                className="material-symbols-outlined text-[18px]"
                aria-hidden
              >
                filter_drama
              </span>
              <input
                type="range"
                min={angleRange.min}
                max={angleRange.max}
                step={angleRange.step}
                value={shadowAngleDeg}
                onInput={(event) =>
                  setShadowAngleDeg(
                    Number((event.target as HTMLInputElement).value),
                  )
                }
                disabled={!modelLoaded}
                className="h-1.5 w-14 cursor-pointer accent-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-20"
                aria-label={shadowAngleLabel}
                aria-valuemin={angleRange.min}
                aria-valuemax={angleRange.max}
                aria-valuenow={shadowAngleDeg}
              />
            </div>

            {!fullscreen && (
              <p className="hidden min-w-0 flex-1 truncate text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-white/90 md:block">
                {t("hint")}
              </p>
            )}

            {fullscreen && (
              <p className="min-w-0 flex-1 truncate text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-white/90">
                {t("hint")}
              </p>
            )}

            {onFullscreen && !fullscreen ? (
              <button
                type="button"
                onClick={onFullscreen}
                className="ml-auto flex shrink-0 items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aa-focus-ring sm:px-3 sm:text-xs"
              >
                <span className="material-symbols-outlined text-[18px]">
                  fullscreen
                </span>
                <span className="hidden sm:inline">{t("fullscreen")}</span>
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
