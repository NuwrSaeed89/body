import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CheckoutLayout } from "@/components/checkout/checkout-layout";
import { CheckoutPaymentForm } from "@/components/checkout/checkout-payment-form";
import { OrderSummary } from "@/components/checkout/order-summary";
import { getCheckoutPaymentAvailability } from "@/lib/payment/payment-methods";
import { getPaymentConfigStatus } from "@/lib/payment/provider-env";
import { requireUser } from "@/lib/auth/require-user";

type PaymentPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireUser(locale, `/${locale}/checkout/payment`);
  const t = await getTranslations("checkout.payment");
  const availability = getCheckoutPaymentAvailability(getPaymentConfigStatus());

  return (
    <>
      <SiteHeader />
      <CheckoutLayout step={2} title={t("title")} summary={<OrderSummary />}>
        <CheckoutPaymentForm locale={locale} availability={availability} />
      </CheckoutLayout>
      <SiteFooter />
    </>
  );
}
