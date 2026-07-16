import { ImageWithShimmer as Image } from "@/components/ui/image-with-shimmer";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FormattedPrice } from "@/components/ui/formatted-price";
import type { Product } from "@/lib/home-data";

type ProductCardProps = {
  product: Product;
  layout?: "feature" | "grid";
  ctaLabelKey?: string;
};

export async function ProductCard({
  product,
  layout = "grid",
  ctaLabelKey = "product.shopNow",
}: ProductCardProps) {
  const t = await getTranslations();
  const isFeature = layout === "feature" || product.colSpan === "feature";

  const card = (
    <>
      <div
        className={`relative w-full overflow-hidden ${
          isFeature ? "aspect-[16/9]" : "aspect-[4/5]"
        }`}
      >
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes={
            isFeature
              ? "(max-width: 768px) 100vw, 66vw"
              : "(max-width: 768px) 100vw, 33vw"
          }
          quality={75}
        />
        {product.badgeKey && (
          <div className="absolute left-6 top-6">
            <span className="bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white">
              {t(`badges.${product.badgeKey}`)}
            </span>
          </div>
        )}
      </div>

      <div
        className={`flex bg-white ${
          isFeature
            ? "items-center justify-between p-6 md:p-8"
            : "flex-col p-6"
        }`}
      >
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.1em] text-secondary">
            {product.series}
          </p>
          <h3 className="text-base font-semibold tracking-wide text-primary md:text-lg">
            {product.name}
          </h3>
          {product.priceSek > 0 && (
            <p className="mt-2 text-sm text-secondary">
              <FormattedPrice amountSek={product.priceSek} />
            </p>
          )}
        </div>
        <button
          type="button"
          className={`rounded-lg border border-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-primary transition-all hover:bg-primary hover:text-white ${
            isFeature ? "" : "mt-6 w-full"
          }`}
        >
          {t(ctaLabelKey)}
        </button>
      </div>
    </>
  );

  const className = `group relative overflow-hidden rounded-xl bg-surface-container-low transition-all duration-500 hover:shadow-xl ${
    isFeature ? "md:col-span-8" : "md:col-span-4"
  }`;

  if (product.href) {
    return (
      <Link href={product.href} className={className}>
        {card}
      </Link>
    );
  }

  return <div className={className}>{card}</div>;
}
