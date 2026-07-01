import { setRequestLocale } from "next-intl/server";
import { CartPageShell } from "@/components/cart/cart-page-shell";

type CartPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function CartPage({ params }: CartPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <CartPageShell />;
}
