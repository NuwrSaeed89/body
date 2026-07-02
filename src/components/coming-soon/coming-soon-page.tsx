import { getTranslations } from "next-intl/server";
import { HERO_IMAGE, LAUNCH_GRAIN_TEXTURE } from "@/lib/home-data";
import { LAUNCH_AT_ISO } from "@/lib/launch-config";
import { ComingSoonFooter } from "./coming-soon-footer";
import { ComingSoonHeader } from "./coming-soon-header";
import { ComingSoonHeroBackground } from "./coming-soon-hero-background";
import { ComingSoonLaunchContent } from "./coming-soon-launch-content";

export async function ComingSoonPage() {
  const t = await getTranslations("launch");
  const tCountdown = await getTranslations("countdown");

  const labels = {
    eyebrow: t("eyebrow"),
    title: t("title"),
    description: t("description"),
    emailPlaceholder: t("emailPlaceholder"),
    notify: t("notify"),
    shopCollection: t("shopCollection"),
    liveNow: t("liveNow"),
    success: t("success"),
  };

  const countdown = {
    ariaLabel: tCountdown("ariaLabel"),
    days: tCountdown("days"),
    hours: tCountdown("hours"),
    minutes: tCountdown("minutes"),
    seconds: tCountdown("seconds"),
  };

  return (
    <div className="overflow-hidden bg-surface text-on-surface selection:bg-primary selection:text-white">
      <ComingSoonHeader />
      <main
        id="main-content"
        tabIndex={-1}
        className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-x-hidden overflow-y-auto"
      >
        <ComingSoonHeroBackground src={HERO_IMAGE} alt={t("imageAlt")} />
        <ComingSoonLaunchContent
          targetIso={LAUNCH_AT_ISO}
          labels={labels}
          countdown={countdown}
        />
        <div
          className="pointer-events-none absolute inset-0 z-30 opacity-[0.03]"
          style={{ backgroundImage: `url('${LAUNCH_GRAIN_TEXTURE}')` }}
          aria-hidden
        />
      </main>
      <ComingSoonFooter />
    </div>
  );
}
