import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HeroCountdownPill } from "@/components/ui/hero-countdown-pill";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import {
  DROP_TARGET_ISO,
  HERO_IMAGE,
  HERO_IMAGE_DESKTOP,
} from "@/lib/home-data";

export async function HeroSection() {
  const t = await getTranslations("hero");

  return (
    <section className="relative flex h-[751px] w-full flex-col justify-end overflow-hidden md:min-h-[92vh]">
      <div className="absolute inset-0 z-0">
        <Image
          src={HERO_IMAGE}
          alt={t("imageAlt")}
          fill
          priority
          className="object-cover md:hidden"
          sizes="100vw"
        />
        <Image
          src={HERO_IMAGE_DESKTOP}
          alt={t("imageAlt")}
          fill
          priority
          className="hidden object-cover md:block"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:from-primary/80 md:via-primary/20" />
      </div>

      {/* Mobile — bottom-aligned per Stitch */}
      <div className="relative z-10 px-5 pb-16 text-white md:hidden">
        <HeroCountdownPill targetIso={DROP_TARGET_ISO} />
        <h1 className="mb-4 max-w-[280px] text-[32px] font-medium leading-tight tracking-tight">
          {t("title")}
        </h1>
        <p className="mb-8 max-w-[300px] text-base leading-relaxed text-white/90">
          {t("description")}
        </p>
        <Link
          href="/shop"
          className="inline-block rounded-lg bg-white px-10 py-4 text-xs font-semibold uppercase tracking-[0.1em] text-primary transition-transform active:scale-95"
        >
          {t("shopNow")}
        </Link>
      </div>

      {/* Desktop — centered layout */}
      <div className="relative z-10 hidden min-h-[92vh] flex-col items-center justify-center px-16 pt-24 text-center md:flex">
        <span className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-white/90">
          {t("eyebrow")}
        </span>
        <h1 className="mb-8 max-w-4xl text-7xl font-medium leading-[1.05] tracking-tight text-white">
          {t("titleDesktop")}
        </h1>
        <p className="mb-10 max-w-xl text-lg leading-relaxed text-white/80">
          {t("descriptionDesktop")}
        </p>
        <CountdownTimer targetIso={DROP_TARGET_ISO} className="mb-10" />
        <div className="flex flex-row gap-4">
          <Link
            href="/shop"
            className="rounded-lg bg-white px-10 py-4 text-xs font-semibold uppercase tracking-[0.1em] text-primary transition-all hover:bg-surface-variant"
          >
            {t("shopNow")}
          </Link>
          <Link
            href="/new-drops"
            className="rounded-lg border border-white/30 px-10 py-4 text-xs font-semibold uppercase tracking-[0.1em] text-white transition-all hover:bg-white/10"
          >
            {t("viewNewDrops")}
          </Link>
        </div>
      </div>
    </section>
  );
}
