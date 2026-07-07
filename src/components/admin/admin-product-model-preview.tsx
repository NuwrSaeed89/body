"use client";

import dynamic from "next/dynamic";

const ProductModelViewer = dynamic(
  () => import("@/components/pdp/product-model-viewer").then((mod) => mod.ProductModelViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[180px] items-center justify-center bg-surface-container-low">
        <span className="material-symbols-outlined animate-spin text-3xl text-on-surface-variant">
          progress_activity
        </span>
      </div>
    ),
  },
);

type AdminProductModelPreviewProps = {
  src: string;
  alt: string;
};

export function AdminProductModelPreview({ src, alt }: AdminProductModelPreviewProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-low">
      <ProductModelViewer
        src={src}
        alt={alt}
        className="h-[200px] w-full md:h-[240px]"
      />
    </div>
  );
}
