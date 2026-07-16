import { getTranslations } from "next-intl/server";
import { NewsletterSignupForm } from "@/components/newsletter/newsletter-signup-form";

export async function NewsletterSection() {
  const t = await getTranslations("newsletter");

  return (
    <section className="bg-primary py-24 text-on-primary md:py-32">
      <div className="mx-auto max-w-[1440px] px-5 text-center md:px-16">
        <h2 className="mb-6 text-2xl font-medium uppercase tracking-[0.1em] md:text-3xl">
          {t("title")}
        </h2>
        <p className="mx-auto mb-12 max-w-xl text-base leading-relaxed opacity-70">
          {t("description")}
        </p>

        <NewsletterSignupForm
          source="homepage"
          variant="hero"
          className="mx-auto max-w-md text-left"
        />
      </div>
    </section>
  );
}
