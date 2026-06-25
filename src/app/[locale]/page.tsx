import { setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CompleteTheLookSection } from "@/components/home/complete-the-look-section";
import { CoreElementsSection } from "@/components/home/core-elements-section";
import { HeroSection } from "@/components/home/hero-section";
import { LatestDropsCarousel } from "@/components/home/latest-drops-carousel";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { ProductSection } from "@/components/home/product-section";
import { BEST_SELLERS, NEW_DROPS, PREMIUM_COLLECTION } from "@/lib/home-data";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <SiteHeader layout="home" />
      <main>
        <HeroSection />
        <LatestDropsCarousel />
        <CoreElementsSection />

        <div className="hidden md:block">
          <ProductSection
            id="new-drops"
            titleKey="home.latestDrop.title"
            descriptionKey="home.latestDrop.description"
            products={NEW_DROPS}
            ctaLabelKey="home.latestDrop.cta"
            layout="bento"
          />
          <ProductSection
            id="collections"
            titleKey="home.premiumCollection.title"
            descriptionKey="home.premiumCollection.description"
            products={PREMIUM_COLLECTION}
            layout="grid"
          />
          <ProductSection
            id="best-sellers"
            titleKey="home.bestSellers.title"
            descriptionKey="home.bestSellers.description"
            products={BEST_SELLERS}
            layout="grid"
          />
        </div>

        <CompleteTheLookSection />
        <NewsletterSection />
      </main>
      <SiteFooter />
    </>
  );
}
