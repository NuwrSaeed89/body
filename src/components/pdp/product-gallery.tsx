"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ProductDetail } from "@/lib/shop-data";

const ProductModelViewer = dynamic(
  () =>
    import("@/components/pdp/product-model-viewer").then(
      (mod) => mod.ProductModelViewer,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[inherit] w-full items-center justify-center bg-surface-container-low md:min-h-[600px] md:rounded-xl">
        <span className="material-symbols-outlined animate-spin text-4xl text-secondary">
          progress_activity
        </span>
      </div>
    ),
  },
);

type ProductGalleryProps = {
  product: ProductDetail;
};

type ViewMode = "images" | "3d";

function isExternalImage(src: string): boolean {
  return src.startsWith("http");
}

export function ProductGallery({ product }: ProductGalleryProps) {
  const t = useTranslations("pdp.viewer");
  const has3d = Boolean(product.modelGlbUrl);
  const hasMultipleImages = product.images.length > 1;
  const [viewMode, setViewMode] = useState<ViewMode>("images");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isMobileFullscreen3d, setIsMobileFullscreen3d] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeImage = product.images[activeImageIndex] ?? product.images[0];
  const show3d = has3d && viewMode === "3d";
  const useDesktopRail = hasMultipleImages;

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const slideWidth = el.clientWidth;
    if (slideWidth === 0) return;
    setActiveSlide(Math.round(el.scrollLeft / slideWidth));
  }, []);

  const selectImage = (index: number) => {
    setViewMode("images");
    setActiveImageIndex(index);
  };

  const select3d = () => {
    setViewMode("3d");
  };

  useEffect(() => {
    if (!show3d) setIsMobileFullscreen3d(false);
  }, [show3d]);

  useEffect(() => {
    if (!isMobileFullscreen3d) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileFullscreen3d]);

  const modeTabs = has3d && !useDesktopRail && (
    <div
      className="mb-3 inline-flex items-center gap-1 rounded-lg bg-surface-container-low p-1"
      role="tablist"
      aria-label={t("modeLabel")}
    >
      <button
        type="button"
        role="tab"
        aria-selected={viewMode === "images"}
        onClick={() => setViewMode("images")}
        className={`rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aa-focus-ring ${
          viewMode === "images"
            ? "bg-primary text-white"
            : "text-secondary hover:text-primary"
        }`}
      >
        {t("images")}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={viewMode === "3d"}
        onClick={select3d}
        className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aa-focus-ring ${
          viewMode === "3d"
            ? "bg-primary text-white"
            : "text-secondary hover:text-primary"
        }`}
      >
        <span className="material-symbols-outlined text-[16px]">view_in_ar</span>
        {t("view3d")}
      </button>
    </div>
  );

  const stageClassName = `relative w-full overflow-hidden md:aspect-auto md:min-h-[600px] md:rounded-xl ${
    show3d && isMobileFullscreen3d
      ? "fixed inset-0 z-[70] bg-surface"
      : "aspect-[4/5]"
  }`;

  const renderModelViewer = (className = "") => (
    <ProductModelViewer
      src={product.modelGlbUrl!}
      alt={product.imageAlt}
      poster={product.images[0]?.src}
      className={`h-full w-full ${isMobileFullscreen3d ? "" : "min-h-[inherit] md:min-h-[600px] md:rounded-xl"} ${className}`}
    />
  );

  const renderCarousel = () => (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex h-full snap-x snap-x-mandatory overflow-x-auto hide-scrollbar"
    >
      {product.images.map((image, index) => (
        <div
          key={image.src}
          className="relative min-w-full shrink-0 snap-start"
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover"
            sizes="100vw"
            priority={index === 0}
            unoptimized={isExternalImage(image.src)}
          />
        </div>
      ))}
    </div>
  );

  const renderSingleImage = (image = product.images[0]) => (
    <Image
      src={image.src}
      alt={image.alt}
      fill
      className="object-cover"
      sizes="(max-width: 768px) 100vw, 50vw"
      priority
      unoptimized={isExternalImage(image.src)}
    />
  );

  const renderDesktopMain = () => {
    if (show3d) return renderModelViewer();
    if (activeImage) {
      return (
        <Image
          src={activeImage.src}
          alt={activeImage.alt}
          fill
          className="object-cover"
          sizes="45vw"
          priority={activeImageIndex === 0}
          unoptimized={isExternalImage(activeImage.src)}
        />
      );
    }
    return null;
  };

  const renderMobileMain = () => {
    if (show3d) return renderModelViewer();
    if (hasMultipleImages) return renderCarousel();
    if (product.images[0]) return renderSingleImage(product.images[0]);
    return null;
  };

  const renderDesktopSingleMain = () => {
    if (show3d) return renderModelViewer();
    if (product.images.length === 1 && product.images[0]) {
      return renderSingleImage(product.images[0]);
    }
    if (product.images.length > 1) {
      return (
        <div className="flex flex-col gap-4">
          {product.images.map((image, index) => (
            <div
              key={image.src}
              className="relative aspect-[4/5] overflow-hidden rounded-xl"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="50vw"
                priority={index === 0}
                unoptimized={isExternalImage(image.src)}
              />
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative w-full md:sticky md:top-24 md:self-start">
      {modeTabs}

      {has3d && useDesktopRail && (
        <div
          className="mb-3 inline-flex items-center gap-1 rounded-lg bg-surface-container-low p-1 md:hidden"
          role="tablist"
          aria-label={t("modeLabel")}
        >
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "images"}
            onClick={() => setViewMode("images")}
            className={`rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aa-focus-ring ${
              viewMode === "images"
                ? "bg-primary text-white"
                : "text-secondary hover:text-primary"
            }`}
          >
            {t("images")}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "3d"}
            onClick={select3d}
            className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aa-focus-ring ${
              viewMode === "3d"
                ? "bg-primary text-white"
                : "text-secondary hover:text-primary"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">view_in_ar</span>
            {t("view3d")}
          </button>
        </div>
      )}

      {useDesktopRail && (
        <div className="hidden md:flex md:items-start md:gap-4">
          <div
            className="flex shrink-0 flex-col gap-3"
            role="tablist"
            aria-label={t("modeLabel")}
          >
            {product.images.map((image, index) => {
              const isActive = viewMode === "images" && activeImageIndex === index;
              return (
                <button
                  key={image.src}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={image.alt}
                  onClick={() => selectImage(index)}
                  className={`relative size-[72px] overflow-hidden rounded-xl bg-surface-container-low transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aa-focus-ring ${
                    isActive
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-surface"
                      : "opacity-80 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={image.src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="72px"
                    unoptimized={isExternalImage(image.src)}
                  />
                </button>
              );
            })}

            {has3d && (
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === "3d"}
                onClick={select3d}
                className={`flex size-[72px] flex-col items-center justify-center gap-1 rounded-xl border border-outline-variant/40 bg-surface-container-low text-primary transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aa-focus-ring ${
                  viewMode === "3d"
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-surface"
                    : "opacity-80 hover:opacity-100"
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">view_in_ar</span>
                <span className="text-[9px] font-bold uppercase tracking-[0.12em]">
                  {t("view3d")}
                </span>
              </button>
            )}
          </div>

          <div className={`${stageClassName} min-h-[600px] flex-1`}>
            {renderDesktopMain()}
          </div>
        </div>
      )}

      <div className={useDesktopRail ? "md:hidden" : ""}>
        <div className={`${stageClassName} relative`}>
          {useDesktopRail ? renderMobileMain() : renderDesktopSingleMain()}
        </div>

        {!show3d && hasMultipleImages && (
          <div
            className={`flex gap-1.5 ${useDesktopRail ? "mt-4 justify-center" : "absolute bottom-6 left-6"}`}
            aria-hidden
          >
            {product.images.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  index === activeSlide ? "bg-primary" : "bg-outline-variant"
                }`}
              />
            ))}
          </div>
        )}

        {show3d && !isMobileFullscreen3d && (
          <button
            type="button"
            onClick={() => setIsMobileFullscreen3d(true)}
            className="absolute bottom-6 right-6 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aa-focus-ring md:hidden"
          >
            <span className="material-symbols-outlined text-[18px]">fullscreen</span>
            {t("fullscreen")}
          </button>
        )}

        {show3d && isMobileFullscreen3d && (
          <button
            type="button"
            onClick={() => setIsMobileFullscreen3d(false)}
            className="absolute right-4 top-4 z-20 flex items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-primary shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aa-focus-ring md:hidden"
            aria-label={t("exitFullscreen")}
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
            {t("exitFullscreen")}
          </button>
        )}
      </div>

      {show3d && (
        <p className="mt-3 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-secondary md:hidden">
          {t("hint")}
        </p>
      )}
    </div>
  );
}
