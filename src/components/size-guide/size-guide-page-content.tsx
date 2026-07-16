"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MBODY_SIZE_CHART } from "@/lib/size-guide";
import { SmartSizeGuideDialog } from "@/components/size-guide/smart-size-guide-dialog";

export function SizeGuidePageContent() {
  const t = useTranslations("sizeGuide");
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mx-auto max-w-3xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight text-primary md:text-5xl">
          {t("page.title")}
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-on-surface-variant md:text-base">
          {t("page.description")}
        </p>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-8 rounded-lg bg-primary px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-on-primary transition-opacity hover:opacity-90"
        >
          {t("banner.cta")}
        </button>

        <div className="mt-14 overflow-x-auto rounded-xl border border-outline-variant/40">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="bg-surface-container text-[10px] uppercase tracking-[0.1em] text-secondary">
              <tr>
                <th className="px-4 py-3 font-semibold">{t("chart.size")}</th>
                <th className="px-4 py-3 font-semibold">{t("chart.height")}</th>
                <th className="px-4 py-3 font-semibold">{t("chart.weight")}</th>
                <th className="px-4 py-3 font-semibold">{t("chart.bust")}</th>
                <th className="px-4 py-3 font-semibold">{t("chart.waist")}</th>
                <th className="px-4 py-3 font-semibold">{t("chart.hip")}</th>
              </tr>
            </thead>
            <tbody>
              {MBODY_SIZE_CHART.map((row) => (
                <tr key={row.size} className="border-t border-outline-variant/30">
                  <td className="px-4 py-3 font-semibold text-primary">{row.size}</td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    {row.heightCm[0]}–{row.heightCm[1]}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    {row.weightKg[0]}–{row.weightKg[1]}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    {row.bustCm[0]}–{row.bustCm[1]}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    {row.waistCm[0]}–{row.waistCm[1]}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    {row.hipCm[0]}–{row.hipCm[1]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-on-surface-variant">{t("chart.disclaimer")}</p>

        <p className="mt-10 text-sm text-secondary">
          <Link href="/shop" className="font-semibold text-primary underline underline-offset-4">
            {t("page.shopCta")}
          </Link>
        </p>
      </div>

      <SmartSizeGuideDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
