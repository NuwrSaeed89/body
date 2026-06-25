import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { AUTH_HERO_IMAGE } from "@/lib/auth-data";

export async function AuthVisualPanel() {
  const t = await getTranslations("account.login");

  return (
    <div className="relative hidden overflow-hidden bg-surface-container-high md:block md:w-1/2">
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-transparent to-surface/10" />
      <Image
        src={AUTH_HERO_IMAGE}
        alt=""
        fill
        priority
        className="object-cover transition-transform duration-[2000ms] ease-out scale-105 hover:scale-100"
        sizes="50vw"
      />
      <div className="absolute bottom-16 left-16 z-20 max-w-sm md:bottom-[64px] md:left-[64px]">
        <h2 className="mb-4 text-4xl font-medium leading-[1.1] tracking-tight text-primary md:text-5xl">
          {t("visualTitle")}
        </h2>
        <p className="text-base leading-relaxed text-secondary">
          {t("visualDescription")}
        </p>
      </div>
    </div>
  );
}
