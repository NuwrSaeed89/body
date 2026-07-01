import { getTranslations } from "next-intl/server";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import {
  LEGAL_PAGE_SECTIONS,
  type LegalPageSlug,
} from "@/lib/legal-pages";

type LegalPageShellProps = {
  page: LegalPageSlug;
};

export async function LegalPageShell({ page }: LegalPageShellProps) {
  const t = await getTranslations("legal");
  const pageT = await getTranslations(`legal.${page}`);
  const { sections } = LEGAL_PAGE_SECTIONS[page];

  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-[60vh] px-5 pb-10 pt-28 md:px-16 md:pb-16 md:pt-32"
      >
        <article className="mx-auto max-w-3xl">
          <p className="mb-6 rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-xs leading-relaxed text-on-surface-variant md:text-sm">
            {t("placeholderBanner")}
          </p>

          <header className="mb-10 border-b border-outline-variant/30 pb-8">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-accent">
              {t("euComplianceLabel")}
            </p>
            <h1 className="text-2xl font-medium tracking-tight text-primary md:text-4xl">
              {pageT("title")}
            </h1>
            <p className="mt-3 text-sm text-secondary">{t("lastUpdated")}</p>
          </header>

          <div className="space-y-10">
            {sections.map((section) => (
              <section key={section.id} aria-labelledby={`${page}-${section.id}`}>
                <h2
                  id={`${page}-${section.id}`}
                  className="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-primary md:text-base"
                >
                  {pageT(`sections.${section.id}.title`)}
                </h2>
                <div className="space-y-3 text-sm leading-relaxed text-secondary md:text-base">
                  {pageT
                    .raw(`sections.${section.id}.paragraphs`)
                    .map((paragraph: string, index: number) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                </div>
              </section>
            ))}
          </div>

          <footer className="mt-12 border-t border-outline-variant/30 pt-8">
            <p className="text-sm text-on-surface-variant">
              {t("questionsPrefix")}{" "}
              <a
                href={`mailto:${t("contactEmail")}`}
                className="font-medium text-primary underline underline-offset-4"
              >
                {t("contactEmail")}
              </a>
            </p>
          </footer>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
