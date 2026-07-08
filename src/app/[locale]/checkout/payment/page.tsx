import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CheckoutLayout } from "@/components/checkout/checkout-layout";
import { OrderSummary } from "@/components/checkout/order-summary";
import { requireUser } from "@/lib/auth/require-user";

type PaymentPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireUser(locale, `/${locale}/checkout/payment`);
  const t = await getTranslations("checkout.payment");

  return (
    <>
      <SiteHeader />
      <CheckoutLayout step={2} title={t("title")} summary={<OrderSummary />}>
        <form className="space-y-8">
          <fieldset className="space-y-3">
            <legend className="mb-4 text-sm font-semibold uppercase tracking-[0.1em] text-primary">
              {t("method")}
            </legend>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-primary bg-surface-container-low p-4">
              <input type="radio" name="payment" defaultChecked className="text-primary" />
              <span className="material-symbols-outlined">payments</span>
              <div>
                <p className="text-sm font-medium">{t("cod")}</p>
                <p className="text-sm text-secondary">{t("codDescription")}</p>
              </div>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-outline-variant p-4 opacity-60">
              <input type="radio" name="payment" disabled className="text-primary" />
              <span className="material-symbols-outlined">credit_card</span>
              <div>
                <p className="text-sm font-medium">{t("card")}</p>
                <p className="text-sm text-secondary">{t("cardSoon")}</p>
              </div>
            </label>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="mb-4 text-sm font-semibold uppercase tracking-[0.1em] text-primary">
              {t("billing")}
            </legend>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="rounded text-primary" />
              <span className="text-sm text-secondary">{t("sameAsShipping")}</span>
            </label>
          </fieldset>

          <button
            type="submit"
            className="w-full rounded-lg bg-primary py-4 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-opacity hover:opacity-90 sm:w-auto sm:px-12"
          >
            {t("placeOrder")}
          </button>
        </form>
      </CheckoutLayout>
      <SiteFooter />
    </>
  );
}
