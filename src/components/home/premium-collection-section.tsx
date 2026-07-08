import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ProductCardWishlistAction } from "@/components/product/product-card-wishlist-action";
import { FormattedPrice } from "@/components/ui/formatted-price";
import { Link } from "@/i18n/navigation";
import { getStorefrontPremiumEditorial } from "@/lib/catalog/get-storefront-catalog";

const aspectClass = {
  "3/4": "aspect-[3/4]",
  "4/5": "aspect-[4/5]",
  square: "aspect-square",
  "16/9": "aspect-[16/9]",
} as const;

type PremiumCollectionSectionProps = {
  locale: string;
};

export async function PremiumCollectionSection({ locale }: PremiumCollectionSectionProps) {
  const t = await getTranslations("home.premiumCollection");
  const columns = await getStorefrontPremiumEditorial(locale);

  return (
    <section id="collections" className="bg-background py-24">
      <div className="mx-auto max-w-[1440px] px-5 md:px-16">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
              {t("eyebrow")}
            </span>
            <h2 className="text-2xl font-medium tracking-tight text-primary md:text-3xl">
              {t("title")}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {columns.map((column) => (
            <div key={column.product.id} className="flex flex-col gap-6">
              <Link href={column.product.href ?? "/shop"} className="group cursor-pointer">
                <div
                  className={`image-zoom-container relative mb-4 overflow-hidden rounded-lg bg-surface-container-low luxury-shadow ${aspectClass[column.product.aspectRatio]}`}
                >
                  <Image
                    src={column.product.image}
                    alt={column.product.imageAlt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized={column.product.image.startsWith("http")}
                  />
                  <ProductCardWishlistAction productId={column.product.id} />
                  <span className="absolute bottom-4 left-4 right-4 translate-y-4 rounded-lg bg-white/90 py-3 text-center text-xs font-semibold uppercase tracking-[0.1em] text-primary opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    {t("viewProduct")}
                  </span>
                </div>
                <h3 className="mb-1 text-base text-primary">{column.product.name}</h3>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
                  {column.product.color}
                  {" — "}
                  <FormattedPrice amountSek={column.product.priceSek} />
                </p>
              </Link>

              <div
                className={`relative overflow-hidden rounded-lg bg-surface-container-low luxury-shadow ${aspectClass[column.tile.aspectRatio]}`}
              >
                <Image
                  src={column.tile.image}
                  alt={column.tile.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  unoptimized={column.tile.image.startsWith("http")}
                />
                {column.tile.labelKey && (
                  <div className="absolute bottom-4 left-4 rounded bg-white/80 px-3 py-1 backdrop-blur-sm">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.1em]">
                      {t(column.tile.labelKey)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
