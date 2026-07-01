import { getTranslations } from "next-intl/server";

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

        <form className="mx-auto flex max-w-md gap-0 border-b border-white/30 pb-2 transition-colors focus-within:border-white">
          <input
            type="email"
            placeholder={t("placeholder")}
            className="w-full border-none bg-transparent text-xs font-semibold uppercase tracking-[0.1em] placeholder:text-white/40 focus:ring-0"
          />
          <button
            type="submit"
            className="px-4 text-xs font-semibold uppercase tracking-[0.1em]"
          >
            {t("subscribe")}
          </button>
        </form>
      </div>
    </section>
  );
}
