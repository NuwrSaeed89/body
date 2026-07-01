import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HERO_IMAGE } from "@/lib/home-data";

export async function HeroSection() {
  const t = await getTranslations("hero");

  return (
    <section className="relative h-[600px] w-full overflow-hidden md:h-[870px]">
      <div className="absolute inset-0 z-0">
        <Image
          src={HERO_IMAGE}
          alt={t("imageAlt")}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex h-full max-w-[1440px] flex-col items-start justify-center px-5 text-white md:px-16">
        <h1 className="mb-6 max-w-xl text-[32px] font-medium leading-[1.2] tracking-tight md:text-5xl md:leading-[1.1]">
          {t("title")}
        </h1>
        <p className="mb-10 max-w-md text-base leading-relaxed opacity-90">
          {t("description")}
        </p>
        <Link
          href="/shop"
          className="luxury-shadow rounded-lg bg-primary px-10 py-4 text-xs font-semibold uppercase tracking-[0.1em] text-on-primary transition-all hover:bg-primary/90"
        >
          {t("shopNow")}
        </Link>
      </div>
    </section>
  );
}
