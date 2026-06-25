"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { ShopProduct } from "@/lib/shop-data";

type ShopGridCardProps = {
  product: ShopProduct;
};

export function ShopGridCard({ product }: ShopGridCardProps) {
  const t = useTranslations();

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group relative flex flex-col"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-surface-container">
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {product.badgeKey && (
          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-primary px-2 py-1 text-[10px] font-semibold uppercase tracking-tighter text-white">
              {t(`shop.badges.${product.badgeKey}`)}
            </span>
          </div>
        )}
        <span
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-primary shadow-sm backdrop-blur-sm"
          aria-hidden
        >
          <span className="material-symbols-outlined text-[20px]">favorite</span>
        </span>
        <div className="absolute inset-x-0 bottom-0 hidden translate-y-full bg-white/90 p-3 backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0 md:block">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">
            {t("product.shopNow")}
          </span>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-1">
        <h3 className="text-sm font-medium text-on-surface">{product.name}</h3>
        <p className="text-sm text-secondary">{product.price}</p>
      </div>
    </Link>
  );
}
