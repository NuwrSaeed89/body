import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SCULPT_COLLECTION } from "@/lib/home-data";

export async function SculptCollectionSection() {
  const t = await getTranslations("home.sculptCollection");
  const collection = SCULPT_COLLECTION;

  return (
    <section className="bg-surface-container-low py-24">
      <div className="mx-auto max-w-[1440px] px-5 md:px-16">
        <div className="grid h-auto grid-cols-1 gap-6 md:h-[800px] md:grid-cols-12">
          <Link
            href={collection.href}
            className="group relative block min-h-[480px] overflow-hidden rounded-lg md:col-span-8 md:min-h-0 md:h-full"
          >
            <Image
              src={collection.image}
              alt={collection.imageAlt}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 66vw"
            />
            <div className="absolute bottom-8 left-5 text-white md:bottom-12 md:left-12">
              <h2 className="mb-4 max-w-md text-[32px] font-medium leading-[1.2] tracking-tight md:text-5xl md:leading-[1.1]">
                {t("title")}
              </h2>
              <p className="mb-8 max-w-md text-base leading-relaxed">{t("description")}</p>
              <span className="inline-block rounded-lg bg-white px-8 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-primary transition-all hover:bg-white/90">
                {t("cta")}
              </span>
            </div>
          </Link>

          <div className="flex flex-col gap-6 md:col-span-4">
            <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-outline-variant/10 bg-white p-8 text-center luxury-shadow md:p-12">
              <span className="mb-4 block text-xs font-semibold uppercase tracking-[0.1em] text-primary">
                {t("innovationEyebrow")}
              </span>
              <h3 className="mb-4 text-lg font-semibold tracking-wide text-primary">
                {t("innovationTitle")}
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-on-surface-variant">
                {t("innovationDescription")}
              </p>
              <Link
                href="/shop"
                className="border-b border-primary pb-1 text-xs font-semibold uppercase tracking-[0.1em] text-primary"
              >
                {t("learnMore")}
              </Link>
            </div>

            <div className="relative min-h-[240px] flex-1 overflow-hidden rounded-lg md:min-h-0">
              <Image
                src={collection.fabricImage}
                alt={collection.fabricImageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
