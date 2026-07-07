import { getTranslations } from "next-intl/server";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { PageContainer } from "@/components/ui/page-container";
import { Link } from "@/i18n/navigation";

export async function NotFoundPage() {
  const t = await getTranslations("notFound");

  return (
    <>
      <SiteHeader />
      <PageContainer
        as="main"
        className="flex min-h-[70vh] flex-col items-center justify-center pb-24 pt-32 text-center md:pb-32 md:pt-40"
      >
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
          {t("eyebrow")}
        </p>
        <h1 className="text-6xl font-black tracking-tight text-primary md:text-8xl">404</h1>
        <h2 className="mt-6 max-w-md text-xl font-medium tracking-tight text-primary md:text-2xl">
          {t("title")}
        </h2>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-secondary md:text-base">
          {t("description")}
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aa-focus-ring"
          >
            {t("backHome")}
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-lg border border-outline-variant bg-surface px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aa-focus-ring"
          >
            {t("shopNow")}
          </Link>
        </div>
      </PageContainer>
      <SiteFooter />
    </>
  );
}
