import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CORE_ELEMENTS } from "@/lib/home-data";

export async function CoreElementsSection() {
  const t = await getTranslations("home.coreElements");
  const [feature, ...tiles] = CORE_ELEMENTS;

  return (
    <section id="collections" className="px-5 py-16 md:hidden">
      <div className="mb-12">
        <h2 className="mb-4 text-3xl font-medium tracking-tight text-primary">
          {t("title")}
        </h2>
        <p className="text-base leading-relaxed text-on-surface-variant">
          {t("description")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link
          href={feature.href ?? "/shop"}
          className="relative col-span-2 aspect-[16/9] overflow-hidden rounded-xl shadow-md"
        >
          <Image
            src={feature.image}
            alt={feature.imageAlt}
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute bottom-6 left-6">
            <h4 className="mb-2 text-2xl font-medium text-white">{feature.title}</h4>
            <span className="border-b border-white pb-1 text-xs font-semibold uppercase tracking-[0.1em] text-white">
              {t("explore")}
            </span>
          </div>
        </Link>

        {tiles.map((tile) => (
          <Link
            key={tile.id}
            href={tile.href ?? "/shop"}
            className="relative aspect-[4/5] overflow-hidden rounded-xl shadow-md"
          >
            <Image
              src={tile.image}
              alt={tile.imageAlt}
              fill
              className="object-cover"
              sizes="50vw"
            />
            <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
              <span className="rounded bg-black/20 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white backdrop-blur-sm">
                {tile.label}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
