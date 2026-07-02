import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { AuthFooter } from "@/components/auth/auth-footer";
import { AuthUtilityBar } from "@/components/auth/auth-utility-bar";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

type ForgotPasswordPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ForgotPasswordPage({ params }: ForgotPasswordPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("account.login");

  return (
    <div className="overflow-x-hidden bg-surface text-on-surface">
      <AuthUtilityBar />
      <main id="main-content" tabIndex={-1} className="mx-auto flex min-h-screen w-full max-w-xl items-center px-5 py-24">
        <div className="w-full rounded-xl border border-outline-variant/20 p-8">
          <h1 className="mb-2 text-2xl font-medium text-primary">{t("forgotPasswordTitle")}</h1>
          <p className="mb-8 text-sm text-secondary">{t("forgotPasswordDescription")}</p>
          <ForgotPasswordForm />
          <Link href="/account/login" className="mt-6 inline-block text-xs font-semibold uppercase tracking-[0.1em] text-primary underline underline-offset-4">
            {t("backToLogin")}
          </Link>
        </div>
      </main>
      <AuthFooter />
    </div>
  );
}
