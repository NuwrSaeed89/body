import { getTranslations } from "next-intl/server";

export async function NewsletterSection() {
  const t = await getTranslations("newsletter");

  return (
    <section className="px-5 py-24 text-center md:bg-primary-container md:py-32">
      <div className="mx-auto max-w-[320px] md:max-w-3xl">
        <h2 className="mb-4 text-3xl font-medium tracking-tight text-primary md:mb-6 md:text-5xl md:text-white">
          {t("title")}
        </h2>
        <p className="mx-auto mb-12 max-w-[300px] text-base leading-relaxed text-on-surface-variant md:mb-10 md:max-w-xl md:text-lg md:text-on-primary-container">
          {t("description")}
        </p>

        <form className="mx-auto max-w-[320px] md:max-w-lg">
          <div className="relative mb-8 floating-label-input">
            <input
              id="newsletter-email"
              type="email"
              placeholder=" "
              className="peer w-full border-0 border-b border-outline-variant bg-transparent py-3 transition-colors focus:border-primary focus:ring-0 md:border-outline-variant md:text-white md:focus:border-white"
            />
            <label
              htmlFor="newsletter-email"
              className="pointer-events-none absolute left-0 top-3 origin-left text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant transition-all peer-focus:text-primary md:text-on-primary-container/70 md:peer-focus:text-white"
            >
              {t("emailLabel")}
            </label>
          </div>

          <label className="mb-8 flex items-start gap-3 text-left">
            <input
              type="checkbox"
              className="mt-1 rounded border-outline-variant text-primary focus:ring-primary"
            />
            <span className="text-[10px] leading-relaxed text-on-surface-variant md:text-xs md:text-on-primary-container/70">
              {t("consent")}
            </span>
          </label>

          <button
            type="submit"
            className="w-full rounded-lg bg-primary py-4 text-xs font-semibold uppercase tracking-[0.1em] text-white transition-all hover:bg-opacity-90 md:bg-white md:text-primary md:hover:bg-surface-variant"
          >
            {t("subscribe")}
          </button>
        </form>
      </div>
    </section>
  );
}
