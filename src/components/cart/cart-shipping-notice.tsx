"use client";

import { useTranslations } from "next-intl";
import type { CartSummary } from "@/lib/currency";

type CartShippingNoticeProps = {
  summary: CartSummary;
};

export function CartShippingNotice({ summary }: CartShippingNoticeProps) {
  const t = useTranslations("cart");

  if (summary.freeShipping) {
    return (
      <div className="flex items-center gap-4 rounded-xl bg-surface-container-low p-8">
        <span className="material-symbols-outlined text-2xl text-primary" aria-hidden>
          local_shipping
        </span>
        <div>
          <p className="font-medium text-primary">{t("shippingNoticeTitleFree")}</p>
          <p className="text-sm text-secondary">
            {t("shippingNoticeBodyFree", { threshold: summary.freeShippingThreshold })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-8">
      <span className="material-symbols-outlined text-2xl text-secondary" aria-hidden>
        local_shipping
      </span>
      <div>
        <p className="font-medium text-primary">{t("shippingNoticeTitleProgress")}</p>
        <p className="text-sm text-secondary">
          {t("shippingNoticeBodyProgress", {
            amount: summary.amountUntilFreeShipping,
            threshold: summary.freeShippingThreshold,
          })}
        </p>
      </div>
    </div>
  );
}
