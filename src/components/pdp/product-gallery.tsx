import Image from "next/image";
import type { ProductDetail } from "@/lib/shop-data";

type ProductGalleryProps = {
  product: ProductDetail;
};

export function ProductGallery({ product }: ProductGalleryProps) {
  return (
    <div className="relative w-full md:sticky md:top-24 md:self-start">
      <div className="relative aspect-[4/5] w-full overflow-hidden md:aspect-auto md:min-h-[600px] md:rounded-xl">
        <div className="flex h-full snap-x-mandatory overflow-x-auto hide-scrollbar md:flex-col md:gap-4 md:overflow-visible md:snap-none">
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
              {index === 2 && (
                <div className="absolute inset-0 flex items-center justify-center bg-surface-container md:hidden">
                  <div className="text-center">
                    <span className="material-symbols-outlined mb-4 text-6xl text-outline-variant">
                      3d_rotation
                    </span>
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-secondary">
                      3D View
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="absolute bottom-6 left-6 flex gap-1.5 md:hidden">
          {product.images.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 w-1.5 rounded-full ${
                index === 0 ? "bg-primary" : "bg-outline-variant"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-white shadow-xl md:hidden"
        >
          <span className="material-symbols-outlined text-[18px]">view_in_ar</span>
          3D
        </button>
      </div>
    </div>
  );
}
