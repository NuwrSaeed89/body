import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CORE_ELEMENTS } from "@/lib/home-data";

export async function CoreElementsSection() {
  const t = await getTranslations("home.coreElements");
  const [feature, ...tiles] = CORE_ELEMENTS;

  return (
    <section id="core-elements" className="px-5 py-12 md:hidden">
      <div className="mb-8">
        <h2 className="mb-4 text-[32px] font-medium leading-tight tracking-tight text-primary">
          {t("title")}
        </h2>
        <p className="text-base leading-relaxed text-on-surface-variant">
          {t("description")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link
          href={feature.href ?? "/shop"}
          className="relative col-span-2 aspect-[16/9] overflow-hidden rounded-xl"
        >
          <Image
            src={feature.image}
            alt={feature.imageAlt}
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute bottom-4 left-4">
            <h4 className="mb-1 text-lg font-semibold text-white">{feature.title}</h4>
            <span className="border-b border-white pb-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white">
              {t("explore")}
            </span>
          </div>
        </Link>

        {tiles.map((tile) => (
          <Link
            key={tile.id}
            href={tile.href ?? "/shop"}
            className="relative aspect-[4/5] overflow-hidden rounded-xl"
          >
            <Image
              src={tile.image}
              alt={tile.imageAlt}
              fill
              className="object-cover"
              sizes="50vw"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded bg-black/30 px-2 py-1.5 text-[8px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
                {tile.label}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
