import { getTranslations } from "next-intl/server";
import { HeroBackground } from "@/components/home/hero-background";
import { Link } from "@/i18n/navigation";
import { HERO_IMAGE } from "@/lib/home-data";

export async function HeroSection() {
  const t = await getTranslations("hero");

  return (
    <section className="relative min-h-[min(92vh,720px)] w-full overflow-hidden md:min-h-[870px]">
      <HeroBackground src={HERO_IMAGE} alt={t("imageAlt")} />

      <div className="relative z-10 mx-auto flex min-h-[inherit] max-w-[1440px] flex-col justify-end px-5 pb-16 pt-28 md:justify-center md:px-16 md:pb-0 md:pt-0">
        <div className="max-w-xl md:max-w-2xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
            {t("eyebrow")}
          </p>
          <h1 className="mb-5 text-[clamp(2rem,5.5vw,3.5rem)] font-medium leading-[1.08] tracking-tight text-white">
            {t("title")}
          </h1>
          <p className="mb-10 max-w-md text-base leading-relaxed text-white/85 md:text-lg">
            {t("description")}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/shop"
              className="luxury-shadow inline-flex min-h-12 items-center justify-center rounded-lg bg-white px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary transition-all hover:bg-white/90 active:scale-[0.98]"
            >
              {t("shopNow")}
            </Link>
            <Link
              href="/new-drops"
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/40 bg-white/10 px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm transition-all hover:border-white/60 hover:bg-white/15 active:scale-[0.98]"
            >
              {t("newDrops")}
            </Link>
          </div>
        </div>

        <p className="mt-12 hidden text-[10px] font-semibold uppercase tracking-[0.25em] text-white/50 md:block">
          {t("scrollHint")}
        </p>
      </div>
    </section>
  );
}
