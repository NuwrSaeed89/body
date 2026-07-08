"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { FormattedPrice } from "@/components/ui/formatted-price";
import { ProductCardWishlistAction } from "@/components/product/product-card-wishlist-action";
import { NotifyWhenBackForm } from "@/components/stock-notify/notify-when-back-form";
import { Link } from "@/i18n/navigation";
import type { ShopProduct } from "@/lib/shop-data";

type ShopGridCardProps = {
  product: ShopProduct;
};

function ProductBadge({ product }: { product: ShopProduct }) {
  const t = useTranslations();
  if (product.stockStatus === "low" && product.stockLeft) {
    return (
      <span className="rounded-full bg-error-container px-2 py-1 text-[10px] font-semibold uppercase tracking-tighter text-on-error-container">
        {t("shop.badges.onlyLeft", { count: product.stockLeft })}
      </span>
    );
  }

  if (!product.badgeKey) return null;

  const badgeClass =
    product.badgeKey === "limitedRelease"
      ? "bg-tertiary-container text-on-tertiary-container"
      : "bg-primary text-on-primary";

  return (
    <span
      className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-tighter ${badgeClass}`}
    >
      {t(`shop.badges.${product.badgeKey}`)}
    </span>
  );
}

export function ShopGridCard({ product }: ShopGridCardProps) {
  const t = useTranslations();
  const isOutOfStock = product.stockStatus === "out-of-stock";

  const cardInner = (
    <>
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-surface-container md:aspect-[4/5] md:rounded-lg">
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
            isOutOfStock ? "grayscale-[0.3]" : ""
          }`}
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {!isOutOfStock && (
          <div className="absolute left-3 top-3">
            <ProductBadge product={product} />
          </div>
        )}
        {!isOutOfStock && <ProductCardWishlistAction productId={product.id} />}
        {isOutOfStock && (
          <div
            className="absolute inset-0 flex items-end justify-center bg-black/5 p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <NotifyWhenBackForm
              productId={product.id}
              slug={product.slug}
              variant="compact"
              className="w-full"
            />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 hidden translate-y-full bg-white/90 p-3 backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0 md:block">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">
            {t("product.shopNow")}
          </span>
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-1 md:mt-4">
        <h3 className="truncate text-sm font-medium text-on-surface">{product.name}</h3>
        {isOutOfStock ? (
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
            {t("shop.outOfStock")}
          </p>
        ) : (
          <FormattedPrice
            amountSek={product.priceSek}
            className="text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant"
          />
        )}
      </div>
    </>
  );

  if (isOutOfStock) {
    return (
      <Link href={`/shop/${product.slug}`} className="group relative flex flex-col">
        {cardInner}
      </Link>
    );
  }

  return (
    <Link href={`/shop/${product.slug}`} className="group relative flex flex-col">
      {cardInner}
    </Link>
  );
}
