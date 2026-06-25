import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";

export async function AuthUtilityBar() {
  const t = await getTranslations("account.login");
  const header = await getTranslations("header");

  return (
    <div className="pointer-events-none fixed top-0 z-[60] flex w-full items-center justify-between px-5 py-4 md:px-16">
      <div className="pointer-events-auto flex items-center gap-4">
        <LocaleSwitcher alwaysVisible />
        <span className="text-outline-variant" aria-hidden>
          |
        </span>
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-secondary">
          {header("currency")}
        </span>
      </div>

      <Link
        href="/"
        className="pointer-events-auto text-2xl font-extrabold tracking-tighter text-primary"
      >
        Mbody
      </Link>

      <Link
        href="/#about"
        className="pointer-events-auto text-xs font-semibold uppercase tracking-[0.1em] text-secondary transition-colors hover:text-primary"
      >
        {t("utilityHelp")}
      </Link>
    </div>
  );
}
