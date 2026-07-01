import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "./locale-switcher";
import { CurrencySwitcher } from "./currency-switcher";

export async function UtilityBar() {
  const t = await getTranslations("utilityBar");
  const a11y = await getTranslations("a11y");

  return (
    <div className="relative z-[60] w-full overflow-visible border-b border-outline-variant/30 bg-surface-container-low">
      <nav
        className="mx-auto flex h-10 w-full max-w-[1440px] items-center justify-between overflow-visible px-5 text-xs font-semibold uppercase tracking-[0.08em] text-on-surface-variant md:px-16"
        aria-label={a11y("utilityNav")}
      >
        <div className="flex items-center gap-4 overflow-visible">
          <LocaleSwitcher variant="light" mobile />
          <CurrencySwitcher />
        </div>

        <div className="hidden text-center md:block">{t("promo")}</div>
        <div className="hidden md:block" aria-hidden />
      </nav>
    </div>
  );
}
