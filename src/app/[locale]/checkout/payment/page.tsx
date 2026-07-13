import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CheckoutLayout } from "@/components/checkout/checkout-layout";
import { OrderSummary } from "@/components/checkout/order-summary";
import { PaymentCodForm } from "@/components/checkout/payment-cod-form";
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
        <PaymentCodForm locale={locale} />
      </CheckoutLayout>
      <SiteFooter />
    </>
  );
}
