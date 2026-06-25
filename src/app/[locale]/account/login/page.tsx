import { setRequestLocale } from "next-intl/server";
import { AuthFooter } from "@/components/auth/auth-footer";
import { AuthForms } from "@/components/auth/auth-forms";
import { AuthUtilityBar } from "@/components/auth/auth-utility-bar";
import { AuthVisualPanel } from "@/components/auth/auth-visual-panel";

type LoginPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="overflow-x-hidden bg-surface text-on-surface">
      <AuthUtilityBar />
      <main className="flex min-h-screen flex-col items-stretch md:flex-row">
        <AuthVisualPanel />
        <AuthForms />
      </main>
      <AuthFooter />
    </div>
  );
}
