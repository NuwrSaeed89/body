import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CurrencySwitcher } from "@/components/layout/currency-switcher";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";

export async function AuthUtilityBar() {
  const t = await getTranslations("account.login");

  return (
    <div className="pointer-events-none fixed top-0 z-[60] flex w-full items-center justify-between px-5 py-4 md:px-16">
      <div className="pointer-events-auto flex items-center gap-4 overflow-visible">
        <LocaleSwitcher mobile />
        <CurrencySwitcher />
      </div>

      <Link
        href="/#about"
        className="pointer-events-auto text-xs font-semibold uppercase tracking-[0.1em] text-secondary transition-colors hover:text-primary"
      >
        {t("utilityHelp")}
      </Link>
    </div>
  );
}
