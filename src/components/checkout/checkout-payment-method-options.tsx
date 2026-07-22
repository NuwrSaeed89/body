"use client";

import { useTranslations } from "next-intl";
import {
  CHECKOUT_PAYMENT_METHOD_OPTIONS,
  type CheckoutPaymentAvailability,
  type OrderPaymentMethod,
} from "@/lib/payment/payment-methods";

type CheckoutPaymentMethodOptionsProps = {
  value: OrderPaymentMethod;
  availability: CheckoutPaymentAvailability;
  onChange: (method: OrderPaymentMethod) => void;
};

export function CheckoutPaymentMethodOptions({
  value,
  availability,
  onChange,
}: CheckoutPaymentMethodOptionsProps) {
  const t = useTranslations("checkout.payment");

  return (
    <fieldset className="space-y-3">
      <legend className="mb-4 text-sm font-semibold uppercase tracking-[0.1em] text-primary">
        {t("method")}
      </legend>
      {CHECKOUT_PAYMENT_METHOD_OPTIONS.map((option) => {
        const enabled = availability[option.id];
        const isSelected = value === option.id;

        return (
          <label
            key={option.id}
            className={`flex items-center gap-3 rounded-lg border p-4 transition-colors ${
              enabled ? "cursor-pointer" : "cursor-not-allowed opacity-60"
            } ${
              isSelected && enabled
                ? "border-primary bg-surface-container-low"
                : "border-outline-variant"
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={option.id}
              checked={isSelected}
              disabled={!enabled}
              onChange={() => onChange(option.id)}
              className="text-primary disabled:cursor-not-allowed"
            />
            <span className="material-symbols-outlined">{option.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium">{t(option.labelKey)}</p>
                {!enabled ? (
                  <span className="rounded bg-surface-container-high px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
                    {t("comingSoon")}
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-secondary">{t(option.descriptionKey)}</p>
            </div>
          </label>
        );
      })}
    </fieldset>
  );
}
