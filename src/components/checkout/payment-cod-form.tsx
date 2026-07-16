"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";

type PaymentCodFormProps = {
  locale: string;
};

export function PaymentCodForm({ locale }: PaymentCodFormProps) {
  const t = useTranslations("checkout.payment");
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod">("card");
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
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const endpoint =
        paymentMethod === "cod" ? "/api/checkout/cod" : "/api/checkout/place-order";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
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
      <fieldset className="space-y-3">
        <legend className="mb-4 text-sm font-semibold uppercase tracking-[0.1em] text-primary">
          {t("method")}
        </legend>
        <label
          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 ${
            paymentMethod === "card"
              ? "border-primary bg-surface-container-low"
              : "border-outline-variant"
          }`}
        >
          <input
            type="radio"
            name="payment"
            checked={paymentMethod === "card"}
            onChange={() => setPaymentMethod("card")}
            className="text-primary"
          />
          <span className="material-symbols-outlined">credit_card</span>
          <div>
            <p className="text-sm font-medium">{t("card")}</p>
            <p className="text-sm text-secondary">{t("cardPendingDescription")}</p>
          </div>
        </label>
        <label
          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 ${
            paymentMethod === "cod"
              ? "border-primary bg-surface-container-low"
              : "border-outline-variant"
          }`}
        >
          <input
            type="radio"
            name="payment"
            checked={paymentMethod === "cod"}
            onChange={() => setPaymentMethod("cod")}
            className="text-primary"
          />
          <span className="material-symbols-outlined">payments</span>
          <div>
            <p className="text-sm font-medium">{t("cod")}</p>
            <p className="text-sm text-secondary">{t("codDescription")}</p>
          </div>
        </label>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-4 text-sm font-semibold uppercase tracking-[0.1em] text-primary">
          Shipping details
        </legend>
        <input
          type="text"
          required
          value={form.fullName}
          onChange={(event) => update("fullName", event.target.value)}
          placeholder="Full name"
          className="w-full border border-outline-variant bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none"
        />
        <input
          type="text"
          required
          value={form.line1}
          onChange={(event) => update("line1", event.target.value)}
          placeholder="Address"
          className="w-full border border-outline-variant bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            type="text"
            required
            value={form.city}
            onChange={(event) => update("city", event.target.value)}
            placeholder="City"
            className="w-full border border-outline-variant bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none"
          />
          <input
            type="text"
            required
            value={form.postalCode}
            onChange={(event) => update("postalCode", event.target.value)}
            placeholder="Postal code"
            className="w-full border border-outline-variant bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            type="text"
            required
            value={form.country}
            onChange={(event) => update("country", event.target.value)}
            placeholder="Country"
            className="w-full border border-outline-variant bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none"
          />
          <input
            type="text"
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            placeholder="Phone (optional)"
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
        disabled={submitting}
        className="w-full rounded-lg bg-primary py-4 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-opacity hover:opacity-90 disabled:opacity-60 sm:w-auto sm:px-12"
      >
        {submitting ? "Placing order…" : t("placeOrder")}
      </button>
    </form>
  );
}
