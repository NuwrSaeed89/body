import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { FormattedPrice } from "@/components/ui/formatted-price";
import { Link } from "@/i18n/navigation";
import { BOUTIQUE_FAVORITES } from "@/lib/home-data";

export async function BoutiqueFavoritesSection() {
  const t = await getTranslations("home.boutiqueFavorites");

  return (
    <section id="best-sellers" className="mx-auto max-w-[1440px] px-5 py-24 md:px-16">
      <h2 className="mb-12 text-center text-2xl font-medium tracking-tight text-primary md:text-3xl">
        {t("title")}
      </h2>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {BOUTIQUE_FAVORITES.map((product) => (
          <Link key={product.id} href={product.href ?? "/shop"} className="group">
            <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-lg bg-surface-container-low luxury-shadow">
              <Image
                src={product.image}
                alt={product.imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
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
