import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "./locale-switcher";

export async function UtilityBar() {
  const t = await getTranslations("utilityBar");

  return (
    <nav className="relative z-[60] flex w-full items-center justify-between bg-surface-container-low px-5 py-2 md:hidden">
      <div className="flex items-center gap-4">
        <LocaleSwitcher variant="light" mobile />
        <button
          type="button"
          className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-on-surface-variant"
        >
          {t("currency")}
          <span className="material-symbols-outlined text-[14px]">expand_more</span>
        </button>
      </div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
        {t("shipping")}
      </div>
    </nav>
  );
}
