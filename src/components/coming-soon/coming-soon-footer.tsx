import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LEGAL_PATHS } from "@/lib/legal-pages";

export async function ComingSoonFooter() {
  const t = await getTranslations("launch");
  const year = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 z-40 w-full bg-gradient-to-t from-black/35 to-transparent">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-3 px-5 py-6 sm:flex-row md:px-16 md:py-8">
      <p className="text-sm text-white/50">{t("copyright", { year })}</p>
      <div className="flex gap-8">
        <Link
          href={LEGAL_PATHS.privacy}
          className="text-sm text-white/50 transition-colors hover:text-white"
        >
          {t("privacy")}
        </Link>
        <span className="cursor-default text-sm text-white/50">{t("sustainability")}</span>
      </div>
      </div>
    </footer>
  );
}
