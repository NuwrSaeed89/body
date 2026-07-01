import { setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { BoutiqueFavoritesSection } from "@/components/home/boutique-favorites-section";
import { CompleteTheLookSection } from "@/components/home/complete-the-look-section";
import { HeroSection } from "@/components/home/hero-section";
import { LatestDropSection } from "@/components/home/latest-drop-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { PremiumCollectionSection } from "@/components/home/premium-collection-section";
import { SculptCollectionSection } from "@/components/home/sculpt-collection-section";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <SiteHeader layout="home" />
      <main id="main-content" tabIndex={-1} className="md:pb-0">
        <HeroSection />
        <LatestDropSection />
        <SculptCollectionSection />
        <PremiumCollectionSection />
        <BoutiqueFavoritesSection />
        <CompleteTheLookSection />
        <NewsletterSection />
      </main>
      <SiteFooter />
    </>
  );
}
