import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/site-header";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { DROP_TARGET_ISO, HERO_IMAGE } from "@/lib/home-data";

type LaunchPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LaunchPage({ params }: LaunchPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("launch");

  return (
    <>
      <SiteHeader variant="dark" />
      <main id="main-content" tabIndex={-1} className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 scale-105">
          <div className="absolute inset-0 z-10 bg-primary/20 luxury-gradient" />
          <Image
            src={HERO_IMAGE}
            alt={t("imageAlt")}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>

        <div className="relative z-20 flex flex-col items-center px-5 text-center md:px-16">
          <span className="mb-4 animate-pulse text-xs font-semibold uppercase tracking-[0.3em] text-white/90">
            {t("eyebrow")}
          </span>
          <h1 className="mb-8 max-w-3xl text-[32px] font-medium leading-tight tracking-tighter text-white md:text-[80px]">
            {t("title")}
          </h1>
          <CountdownTimer
            targetIso={DROP_TARGET_ISO}
            variant="launch"
            className="mb-12"
          />
          <p className="mb-10 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
            {t("description")}
          </p>
          <form className="flex w-full max-w-md flex-col gap-4 sm:flex-row">
            <input
              type="email"
              placeholder={t("emailPlaceholder")}
              className="flex-1 border border-white/20 bg-white/10 px-5 py-4 text-sm text-white placeholder:text-white/50 backdrop-blur-sm focus:border-white focus:outline-none"
            />
            <button
              type="submit"
              className="bg-white px-8 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-primary transition-opacity hover:opacity-90"
            >
              {t("notify")}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
