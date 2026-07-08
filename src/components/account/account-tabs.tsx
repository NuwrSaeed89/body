"use client";

import { useTranslations } from "next-intl";

export type AccountTab = "orders" | "wishlist" | "profile";

type AccountTabsProps = {
  activeTab: AccountTab;
  onTabChange: (tab: AccountTab) => void;
};

const TABS: AccountTab[] = ["orders", "wishlist", "profile"];

export function AccountTabs({ activeTab, onTabChange }: AccountTabsProps) {
  const t = useTranslations("account.tabs");

  return (
    <div
      className="flex gap-6 overflow-x-auto border-b border-outline-variant/30 hide-scrollbar md:gap-8"
      role="tablist"
      aria-label={t("ariaLabel")}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab;

        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab)}
            className={`shrink-0 pb-4 text-xs font-semibold uppercase tracking-[0.1em] transition-colors ${
              isActive
                ? "border-b-2 border-primary text-primary"
                : "text-secondary hover:text-primary"
            }`}
          >
            {t(tab)}
          </button>
        );
      })}
    </div>
  );
}
