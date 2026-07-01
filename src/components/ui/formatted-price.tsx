"use client";

import { useTranslations } from "next-intl";
import { useCurrency } from "@/providers/currency-provider";

type FormattedPriceProps = {
  /** VAT-inclusive amount in SEK (catalog base currency). */
  amountSek: number;
  showVat?: boolean;
  className?: string;
  vatClassName?: string;
};

export function FormattedPrice({
  amountSek,
  showVat = false,
  className,
  vatClassName = "text-sm text-secondary",
}: FormattedPriceProps) {
  const { formatFromSek } = useCurrency();
  const t = useTranslations("pdp");

  return (
    <span className={className} suppressHydrationWarning>
      {formatFromSek(amountSek)}
      {showVat && (
        <span className={`${vatClassName} ml-1`}>{t("inclVat")}</span>
      )}
    </span>
  );
}

type FormattedComparePriceProps = {
  amountSek: number;
  compareAtSek: number;
  className?: string;
  compareClassName?: string;
  amountClassName?: string;
};

export function FormattedComparePrice({
  amountSek,
  compareAtSek,
  className,
  compareClassName = "text-sm text-secondary line-through",
  amountClassName = "text-xl font-bold text-primary",
}: FormattedComparePriceProps) {
  const { formatFromSek } = useCurrency();

  return (
    <span className={className} suppressHydrationWarning>
      <span className={`${compareClassName} mr-2`}>{formatFromSek(compareAtSek)}</span>
      <span className={amountClassName}>{formatFromSek(amountSek)}</span>
    </span>
  );
}
