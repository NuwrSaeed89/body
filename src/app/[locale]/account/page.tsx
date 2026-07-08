import { setRequestLocale } from "next-intl/server";
import { AccountPageShell } from "@/components/account/account-page-shell";
import { requireUser } from "@/lib/auth/require-user";

type AccountPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AccountPage({ params }: AccountPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireUser(locale, `/${locale}/account`);

  return <AccountPageShell />;
}
