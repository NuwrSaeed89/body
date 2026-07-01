import { Suspense } from "react";
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
      <main id="main-content" tabIndex={-1} className="flex min-h-screen flex-col items-stretch md:flex-row">
        <AuthVisualPanel />
        <Suspense fallback={null}>
          <AuthForms />
        </Suspense>
      </main>
      <AuthFooter />
    </div>
  );
}
