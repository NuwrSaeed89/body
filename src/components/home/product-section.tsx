import { getTranslations } from "next-intl/server";
import type { Product } from "@/lib/home-data";
import { ProductCard } from "./product-card";

type ProductSectionProps = {
  id: string;
  titleKey: string;
  descriptionKey: string;
  products: Product[];
  ctaLabelKey?: string;
  layout?: "bento" | "grid";
};

export async function ProductSection({
  id,
  titleKey,
  descriptionKey,
  products,
  ctaLabelKey,
  layout = "bento",
}: ProductSectionProps) {
  const t = await getTranslations();

  return (
    <section id={id} className="mx-auto max-w-[1440px] px-5 py-20 md:px-16 md:py-24">
      <div className="mb-12 flex flex-col gap-4 md:mb-16 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-medium tracking-tight text-primary md:text-3xl">
            {t(titleKey)}
          </h2>
          <p className="mt-2 text-base text-secondary">{t(descriptionKey)}</p>
        </div>
      </div>

      <div
        className={
          layout === "bento"
            ? "grid grid-cols-1 gap-6 md:grid-cols-12"
            : "grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6"
        }
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            layout={layout === "bento" && product.colSpan === "feature" ? "feature" : "grid"}
            ctaLabelKey={ctaLabelKey}
          />
        ))}
      </div>
    </section>
  );
}
