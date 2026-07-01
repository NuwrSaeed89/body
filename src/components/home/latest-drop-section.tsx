import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { FormattedPrice } from "@/components/ui/formatted-price";
import { Link } from "@/i18n/navigation";
import { LATEST_DROP_PRODUCTS } from "@/lib/home-data";

export async function LatestDropSection() {
  const t = await getTranslations("home.latestDrop");

  return (
    <section id="new-drops" className="mx-auto max-w-[1440px] px-5 py-24 md:px-16">
      <div className="mb-12 flex items-end justify-between">
        <div>
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
            {t("eyebrow")}
          </span>
          <h2 className="text-2xl font-medium tracking-tight text-primary md:text-3xl">
            {t("title")}
          </h2>
        </div>
        <Link
          href="/new-drops"
          className="border-b border-primary pb-1 text-xs font-semibold uppercase tracking-[0.1em] text-primary transition-opacity hover:opacity-70"
        >
          {t("viewAll")}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
        {LATEST_DROP_PRODUCTS.map((product) => (
          <Link
            key={product.id}
            href={product.href ?? "/shop"}
            className="group cursor-pointer"
          >
            <div className="image-zoom-container relative mb-4 aspect-[4/5] overflow-hidden rounded-lg bg-surface-container-low luxury-shadow">
              <Image
                src={product.image}
                alt={product.imageAlt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              {product.badgeKey === "limited" && (
                <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-tighter text-white">
                  {t("limitedBadge")}
                </span>
              )}
              <span className="absolute bottom-4 left-4 right-4 translate-y-4 rounded-lg bg-white/90 py-3 text-center text-xs font-semibold uppercase tracking-[0.1em] text-primary opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                {t("quickAdd")}
              </span>
            </div>
            <h3 className="mb-1 text-base text-primary">{product.name}</h3>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
              {product.color}
              {" — "}
              <FormattedPrice amountSek={product.priceSek} />
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
