import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LEGAL_PATHS } from "@/lib/legal-pages";

export async function AuthFooter() {
  const t = await getTranslations("account.login");

  return (
    <footer className="border-t border-outline-variant/20 bg-surface">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-8 px-5 py-12 md:flex-row md:px-16">
        <div className="flex flex-wrap justify-center gap-6 md:gap-10">
          <Link
            href="#"
            className="text-[11px] font-semibold uppercase tracking-widest text-secondary transition-colors hover:text-primary"
          >
            {t("footerSustainability")}
          </Link>
          <Link
            href={LEGAL_PATHS.privacy}
            className="text-[11px] font-semibold uppercase tracking-widest text-secondary transition-colors hover:text-primary"
          >
            {t("footerPrivacy")}
          </Link>
          <Link
            href={LEGAL_PATHS.returns}
            className="text-[11px] font-semibold uppercase tracking-widest text-secondary transition-colors hover:text-primary"
          >
            {t("footerShipping")}
          </Link>
        </div>
        <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-secondary">
          {t("copyright")}
        </p>
      </div>
    </footer>
  );
}
