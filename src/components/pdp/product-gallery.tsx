"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useRef, useState } from "react";
import { ProductModelViewer } from "@/components/pdp/product-model-viewer";
import type { ProductDetail } from "@/lib/shop-data";

type ProductGalleryProps = {
  product: ProductDetail;
};

type ViewMode = "images" | "3d";

export function ProductGallery({ product }: ProductGalleryProps) {
  const t = useTranslations("pdp.viewer");
  const has3d = Boolean(product.modelGlbUrl);
  const [viewMode, setViewMode] = useState<ViewMode>("images");
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const slideWidth = el.clientWidth;
    if (slideWidth === 0) return;
    setActiveSlide(Math.round(el.scrollLeft / slideWidth));
  }, []);

  const show3d = has3d && viewMode === "3d";

  return (
    <div className="relative w-full md:sticky md:top-24 md:self-start">
      {has3d && (
        <div
          className="mb-3 hidden items-center gap-1 rounded-lg bg-surface-container-low p-1 md:inline-flex"
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
            onClick={() => setViewMode("3d")}
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

      <div className="relative aspect-[4/5] w-full overflow-hidden md:aspect-auto md:min-h-[600px] md:rounded-xl">
        {show3d ? (
          <ProductModelViewer
            src={product.modelGlbUrl!}
            alt={product.imageAlt}
            poster={product.images[0]?.src}
            className="h-full min-h-[inherit] w-full md:min-h-[600px] md:rounded-xl"
          />
        ) : (
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex h-full snap-x snap-x-mandatory overflow-x-auto hide-scrollbar md:flex-col md:gap-4 md:overflow-visible md:snap-none"
          >
            {product.images.map((image, index) => (
              <div
                key={image.src}
                className="relative min-w-full shrink-0 snap-start md:aspect-[4/5] md:min-w-0 md:overflow-hidden md:rounded-xl"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>
        )}

        {!show3d && (
          <div className="absolute bottom-6 left-6 flex gap-1.5 md:hidden" aria-hidden>
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

        {has3d && (
          <button
            type="button"
            onClick={() => setViewMode(show3d ? "images" : "3d")}
            aria-pressed={show3d}
            className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-white shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aa-focus-ring md:hidden"
          >
            <span className="material-symbols-outlined text-[18px]">
              {show3d ? "photo_library" : "view_in_ar"}
            </span>
            {show3d ? t("backToImages") : t("view3d")}
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
