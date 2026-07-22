"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckoutPaymentMethodOptions } from "@/components/checkout/checkout-payment-method-options";
import {
  getDefaultSelectedPaymentMethod,
  type CheckoutPaymentAvailability,
  type OrderPaymentMethod,
} from "@/lib/payment/payment-methods";

type CheckoutPaymentFormProps = {
  locale: string;
  availability: CheckoutPaymentAvailability;
};

export function CheckoutPaymentForm({ locale, availability }: CheckoutPaymentFormProps) {
  const t = useTranslations("checkout.payment");
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<OrderPaymentMethod>(() =>
    getDefaultSelectedPaymentMethod(availability),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    line1: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting || !availability[paymentMethod]) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout/place-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          paymentMethod,
          shippingAddress: form,
        }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        orderNumber?: string;
        error?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Could not place order");
      }

      router.push(`/${locale}/account?order=${encodeURIComponent(payload.orderNumber ?? "")}`);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not place order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-8" onSubmit={onSubmit}>
      <CheckoutPaymentMethodOptions
        value={paymentMethod}
        availability={availability}
        onChange={setPaymentMethod}
      />

      <fieldset className="space-y-4">
        <legend className="mb-4 text-sm font-semibold uppercase tracking-[0.1em] text-primary">
          {t("shippingDetails")}
        </legend>
        <input
          type="text"
          required
          value={form.fullName}
          onChange={(event) => update("fullName", event.target.value)}
          placeholder={t("fullName")}
          className="w-full border border-outline-variant bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none"
        />
        <input
          type="text"
          required
          value={form.line1}
          onChange={(event) => update("line1", event.target.value)}
          placeholder={t("address")}
          className="w-full border border-outline-variant bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            type="text"
            required
            value={form.city}
            onChange={(event) => update("city", event.target.value)}
            placeholder={t("city")}
            className="w-full border border-outline-variant bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none"
          />
          <input
            type="text"
            required
            value={form.postalCode}
            onChange={(event) => update("postalCode", event.target.value)}
            placeholder={t("postalCode")}
            className="w-full border border-outline-variant bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            type="text"
            required
            value={form.country}
            onChange={(event) => update("country", event.target.value)}
            placeholder={t("country")}
            className="w-full border border-outline-variant bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none"
          />
          <input
            type="text"
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            placeholder={t("phoneOptional")}
            className="w-full border border-outline-variant bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none"
          />
        </div>
      </fieldset>

      {error ? (
        <p className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting || !availability[paymentMethod]}
        className="w-full rounded-lg bg-primary py-4 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-opacity hover:opacity-90 disabled:opacity-60 sm:w-auto sm:px-12"
      >
        {submitting ? t("placingOrder") : t("placeOrder")}
      </button>
    </form>
  );
}
