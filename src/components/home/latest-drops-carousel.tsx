import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ProductCardWishlistAction } from "@/components/product/product-card-wishlist-action";
import { FormattedPrice } from "@/components/ui/formatted-price";
import { Link } from "@/i18n/navigation";
import { LATEST_DROPS_CAROUSEL } from "@/lib/home-data";

export async function LatestDropsCarousel() {
  const t = await getTranslations();

  return (
    <section id="new-drops" className="bg-surface py-12 md:hidden">
      <div className="mb-8 flex items-end justify-between px-5">
        <div>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-secondary">
            {t("home.latestDrop.eyebrow")}
          </span>
          <h2 className="text-2xl font-medium tracking-tight text-primary">
            {t("home.latestDrop.title")}
          </h2>
        </div>
        <Link
          href="/new-drops"
          className="border-b border-primary pb-1 text-xs font-semibold uppercase tracking-[0.1em] text-primary"
        >
          {t("home.latestDrop.viewAll")}
        </Link>
      </div>

      <div className="hide-scrollbar flex snap-x-mandatory gap-6 overflow-x-auto px-5">
        {LATEST_DROPS_CAROUSEL.map((product) => (
          <Link
            key={product.id}
            href={product.href ?? "/shop"}
            className="group min-w-[260px] snap-center"
          >
            <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-xl bg-surface-container-low shadow-sm">
              <Image
                src={product.image}
                alt={product.imageAlt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="260px"
              />
              {product.badgeKey && (
                <span
                  className={`absolute left-4 top-4 rounded px-2 py-1 text-[10px] font-semibold uppercase text-white ${
                    product.badgeKey === "new" ? "bg-primary" : "bg-secondary"
                  }`}
                >
                  {t(`shop.badges.${product.badgeKey}`)}
                </span>
              )}
              <ProductCardWishlistAction productId={product.id} />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-semibold tracking-wide text-primary">
                  {product.name}
                </h3>
                <FormattedPrice
                  amountSek={product.priceSek}
                  className="shrink-0 text-base text-primary"
                />
              </div>
              <p className="text-sm text-on-surface-variant">{product.color}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
