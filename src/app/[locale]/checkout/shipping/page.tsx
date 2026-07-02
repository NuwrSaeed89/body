import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CheckoutLayout } from "@/components/checkout/checkout-layout";
import { OrderSummary } from "@/components/checkout/order-summary";
import { ShippingMethodOptions } from "@/components/checkout/shipping-method-options";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/lib/auth/require-user";

type ShippingPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ShippingPage({ params }: ShippingPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireUser(locale, `/${locale}/checkout/shipping`);
  const t = await getTranslations("checkout.shipping");

  return (
    <>
      <SiteHeader />
      <CheckoutLayout step={1} title={t("title")} summary={<OrderSummary />}>
        <form className="space-y-8">
          <fieldset className="space-y-4">
            <legend className="mb-4 text-sm font-semibold uppercase tracking-[0.1em] text-primary">
              {t("contact")}
            </legend>
            <input
              type="email"
              placeholder={t("email")}
              className="w-full border border-outline-variant bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none"
            />
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="mb-4 text-sm font-semibold uppercase tracking-[0.1em] text-primary">
              {t("address")}
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="text"
                placeholder={t("firstName")}
                className="w-full border border-outline-variant bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none"
              />
              <input
                type="text"
                placeholder={t("lastName")}
                className="w-full border border-outline-variant bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <input
              type="text"
              placeholder={t("addressLine")}
              className="w-full border border-outline-variant bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none"
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <input
                type="text"
                placeholder={t("city")}
                className="w-full border border-outline-variant bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none sm:col-span-2"
              />
              <input
                type="text"
                placeholder={t("postalCode")}
                className="w-full border border-outline-variant bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <input
              type="text"
              placeholder={t("country")}
              className="w-full border border-outline-variant bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none"
            />
          </fieldset>

          <ShippingMethodOptions />

          <Link
            href="/checkout/payment"
            className="inline-block w-full bg-primary py-4 text-center text-xs font-semibold uppercase tracking-[0.15em] text-white sm:w-auto sm:px-12"
          >
            {t("continue")}
          </Link>
        </form>
      </CheckoutLayout>
      <SiteFooter />
    </>
  );
}
