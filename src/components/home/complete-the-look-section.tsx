import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { COMPLETE_THE_LOOK } from "@/lib/home-data";

export async function CompleteTheLookSection() {
  const t = await getTranslations("completeTheLook");
  const look = COMPLETE_THE_LOOK;

  return (
    <section className="bg-surface-container-low py-16 md:py-20">
      {/* Mobile — white card per Stitch */}
      <div className="px-5 md:hidden">
        <div className="overflow-hidden rounded-2xl border border-outline-variant/30 bg-white shadow-xl">
          <div className="relative aspect-square">
            <Image
              src={look.image}
              alt={t("imageAlt")}
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute left-6 top-6">
              <span className="rounded-full bg-primary px-3 py-1.5 text-[10px] font-semibold uppercase text-white">
                {t("setSavings")}
              </span>
            </div>
          </div>
          <div className="p-8">
            <h3 className="mb-2 text-2xl font-medium text-primary">{look.title}</h3>
            <p className="mb-6 text-sm leading-relaxed text-on-surface-variant">
              {look.description}
            </p>
            <div className="mb-8 flex items-center justify-between border-t border-outline-variant/30 pt-6">
              <div>
                <span className="mr-2 text-sm text-secondary line-through">
                  {look.compareAtPrice}
                </span>
                <span className="text-xl font-bold text-primary">{look.price}</span>
              </div>
              <div className="flex -space-x-2">
                {look.colors.map((color) => (
                  <div
                    key={color}
                    className="h-6 w-6 rounded-full border-2 border-white"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <Link
              href="/shop"
              className="block w-full rounded-lg bg-primary py-4 text-center text-xs font-semibold uppercase tracking-[0.1em] text-white transition-transform active:scale-[0.98]"
            >
              {t("shopTheLook")}
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop — split layout */}
      <div className="mx-auto hidden max-w-[1440px] px-16 md:block">
        <div className="grid overflow-hidden rounded-2xl bg-primary-container md:grid-cols-2">
          <div className="relative min-h-[520px]">
            <Image
              src={look.image}
              alt={t("imageAlt")}
              fill
              className="object-cover"
              sizes="50vw"
            />
            <div className="absolute inset-0 bg-primary/20" />
          </div>
          <div className="flex flex-col justify-center px-14 py-16">
            <span className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-on-primary-container">
              {t("eyebrow")}
            </span>
            <h2 className="mb-4 text-4xl font-medium tracking-tight text-white">
              {look.title}
            </h2>
            <p className="mb-8 max-w-md text-base leading-relaxed text-on-primary-container">
              {look.description}
            </p>
            <ul className="mb-8 space-y-2 text-sm text-white/80">
              {look.itemKeys.map((itemKey) => (
                <li key={itemKey} className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">check</span>
                  {t(`items.${itemKey}`)}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-medium text-white">{look.price}</span>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-4 text-xs font-semibold uppercase tracking-[0.1em] text-primary transition-all hover:bg-surface-variant"
              >
                {t("shopTheLook")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
