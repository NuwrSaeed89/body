import { getTranslations } from "next-intl/server";
import { ProductCardWishlistAction } from "@/components/product/product-card-wishlist-action";
import { FormattedPrice } from "@/components/ui/formatted-price";
import { ImageWithShimmer } from "@/components/ui/image-with-shimmer";
import { Link } from "@/i18n/navigation";
import { getStorefrontBestSellers } from "@/lib/catalog/get-storefront-catalog";

type BoutiqueFavoritesSectionProps = {
  locale: string;
};

export async function BoutiqueFavoritesSection({ locale }: BoutiqueFavoritesSectionProps) {
  const t = await getTranslations("home.boutiqueFavorites");
  const products = await getStorefrontBestSellers(locale);

  return (
    <section id="best-sellers" className="mx-auto max-w-[1440px] px-5 py-24 md:px-16">
      <h2 className="mb-12 text-center text-2xl font-medium tracking-tight text-primary md:text-3xl">
        {t("title")}
      </h2>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {products.map((product) => (
          <Link key={product.id} href={product.href ?? "/shop"} className="group">
            <div className="image-zoom-container relative mb-4 aspect-[4/5] overflow-hidden rounded-lg bg-surface-container-low luxury-shadow">
              <ImageWithShimmer
                src={product.image}
                alt={product.imageAlt}
                fill
                quality={85}
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 50vw, 25vw"
                unoptimized={product.image.startsWith("http")}
              />
              <ProductCardWishlistAction productId={product.id} />
            </div>
            <h3 className="mb-1 text-sm font-semibold text-primary">{product.name}</h3>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
              <FormattedPrice amountSek={product.priceSek} />
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
