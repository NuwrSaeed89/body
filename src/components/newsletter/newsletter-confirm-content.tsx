import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { confirmNewsletter } from "@/lib/newsletter/confirm-newsletter";

type NewsletterConfirmContentProps = {
  token?: string;
};

export async function NewsletterConfirmContent({ token }: NewsletterConfirmContentProps) {
  const t = await getTranslations("newsletter.confirm");

  if (!token?.trim()) {
    return (
      <ConfirmShell title={t("invalidTitle")} description={t("invalidDescription")} ctaHref="/" ctaLabel={t("backHome")} />
    );
  }

  const result = await confirmNewsletter(token);

  if (!result.ok) {
    const description =
      result.error === "expired_token" ? t("expiredDescription") : t("invalidDescription");
    return (
      <ConfirmShell
        title={result.error === "expired_token" ? t("expiredTitle") : t("invalidTitle")}
        description={description}
        ctaHref="/"
        ctaLabel={t("backHome")}
      />
    );
  }

  const title = result.alreadyConfirmed ? t("alreadyTitle") : t("successTitle");
  const description = result.alreadyConfirmed ? t("alreadyDescription") : t("successDescription");

  return (
    <ConfirmShell title={title} description={description} ctaHref="/shop" ctaLabel={t("shopCta")} />
  );
}

type ConfirmShellProps = {
  title: string;
  description: string;
  ctaHref: string;
  ctaLabel: string;
};

async function ConfirmShell({ title, description, ctaHref, ctaLabel }: ConfirmShellProps) {
  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-[60vh] px-5 pb-10 pt-28 md:px-16 md:pb-16 md:pt-32"
      >
        <article className="mx-auto max-w-xl text-center">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-accent">
            Mbody Newsletter
          </p>
          <h1 className="text-2xl font-medium tracking-tight text-primary md:text-4xl">{title}</h1>
          <p className="mt-4 text-sm leading-relaxed text-secondary md:text-base">{description}</p>
          <Link
            href={ctaHref}
            className="mt-8 inline-block rounded-lg bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-on-primary"
          >
            {ctaLabel}
          </Link>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
