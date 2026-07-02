import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { FormattedPrice } from "@/components/ui/formatted-price";
import { Link } from "@/i18n/navigation";
import { getStorefrontCompleteTheLook } from "@/lib/catalog/get-storefront-catalog";

type CompleteTheLookSectionProps = {
  locale: string;
};

export async function CompleteTheLookSection({ locale }: CompleteTheLookSectionProps) {
  const t = await getTranslations("completeTheLook");
  const look = await getStorefrontCompleteTheLook(locale);

  return (
    <section className="border-y border-outline-variant/20 bg-white py-24">
      <div className="mx-auto max-w-[1440px] px-5 md:px-16">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-24">
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg luxury-shadow">
            <Image
              src={look.image}
              alt={look.imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              unoptimized={look.image.startsWith("http")}
            />
          </div>

          <div>
            <span className="mb-4 block text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
              {t("eyebrow")}
            </span>
            <h2 className="mb-12 text-[32px] font-medium leading-[1.2] tracking-tight text-primary md:text-5xl md:leading-[1.1]">
              {t("title")}
              <br />
              {t("titleLine2")}
            </h2>

            <ul className="space-y-12">
              {look.items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href ?? "/shop"}
                    className="group flex cursor-pointer items-center gap-6"
                  >
                    <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded bg-surface-container">
                      <Image
                        src={item.image}
                        alt={item.imageAlt}
                        fill
                        className="object-cover"
                        sizes="80px"
                        unoptimized={item.image.startsWith("http")}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-medium text-primary transition-colors group-hover:text-primary/70">
                        {item.name}
                      </h4>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
                        <FormattedPrice amountSek={item.priceSek} />
                      </p>
                    </div>
                    <span className="rounded-full border border-outline-variant p-2 transition-all group-hover:bg-primary group-hover:text-white">
                      <span className="material-symbols-outlined">add</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href="/shop"
              className="mt-16 block w-full rounded-lg border-2 border-primary py-4 text-center text-xs font-semibold uppercase tracking-[0.1em] text-primary transition-all hover:bg-primary hover:text-white"
            >
              {t("addEntireSet")}{" "}
              <FormattedPrice amountSek={look.bundlePriceSek} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
