import { Suspense } from "react";
import { getLocale } from "next-intl/server";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { BoutiqueFavoritesSection } from "@/components/home/boutique-favorites-section";
import { CompleteTheLookSection } from "@/components/home/complete-the-look-section";
import { HeroSection } from "@/components/home/hero-section";
import { HomePageSkeleton } from "@/components/home/home-page-skeleton";
import { LatestDropSection } from "@/components/home/latest-drop-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { PremiumCollectionSection } from "@/components/home/premium-collection-section";
import { SculptCollectionSection } from "@/components/home/sculpt-collection-section";
import { Shimmer, ShimmerText } from "@/components/ui/shimmer";

function HeroSkeleton() {
  return <Shimmer className="h-[600px] w-full rounded-none md:h-[870px]" />;
}

function SectionTitleSkeleton() {
  return (
    <div className="mb-12 space-y-2">
      <Shimmer className="h-3 w-28" />
      <Shimmer className="h-8 w-56" />
    </div>
  );
}

function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <Shimmer className="mb-4 aspect-[4/5] w-full rounded-lg" />
          <ShimmerText className="mb-2 w-3/4" />
          <ShimmerText className="w-1/2" />
        </div>
      ))}
    </div>
  );
}

export async function HomePageContent() {
  const locale = await getLocale();

  return (
    <>
      <SiteHeader layout="home" />
      <main id="main-content" tabIndex={-1} className="md:pb-0">
        <Suspense fallback={<HeroSkeleton />}>
          <HeroSection />
        </Suspense>

        <Suspense
          fallback={
            <section className="mx-auto max-w-[1440px] px-5 py-24 md:px-16">
              <SectionTitleSkeleton />
              <ProductGridSkeleton />
            </section>
          }
        >
          <LatestDropSection locale={locale} />
        </Suspense>

        <Suspense
          fallback={
            <section className="bg-surface-container-low py-24">
              <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-6 px-5 md:h-[800px] md:grid-cols-12 md:px-16">
                <Shimmer className="min-h-[480px] rounded-lg md:col-span-8" />
                <div className="flex flex-col gap-6 md:col-span-4">
                  <Shimmer className="min-h-[240px] flex-1 rounded-lg" />
                  <Shimmer className="min-h-[240px] flex-1 rounded-lg" />
                </div>
              </div>
            </section>
          }
        >
          <SculptCollectionSection locale={locale} />
        </Suspense>

        <Suspense
          fallback={
            <section className="mx-auto max-w-[1440px] px-5 py-24 md:px-16">
              <Shimmer className="mx-auto mb-12 h-8 w-64" />
              <ProductGridSkeleton count={3} />
            </section>
          }
        >
          <PremiumCollectionSection locale={locale} />
        </Suspense>

        <Suspense
          fallback={
            <section className="mx-auto max-w-[1440px] px-5 py-24 md:px-16">
              <Shimmer className="mx-auto mb-12 h-8 w-64" />
              <ProductGridSkeleton count={4} />
            </section>
          }
        >
          <BoutiqueFavoritesSection locale={locale} />
        </Suspense>

        <Suspense
          fallback={
            <section className="mx-auto max-w-[1440px] px-5 py-24 md:px-16">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <Shimmer className="aspect-[4/5] rounded-lg" />
                <div className="flex flex-col justify-center gap-4">
                  <Shimmer className="h-10 w-full max-w-md" />
                  <Shimmer className="h-12 w-40 rounded-lg" />
                </div>
              </div>
            </section>
          }
        >
          <CompleteTheLookSection locale={locale} />
        </Suspense>

        <Suspense
          fallback={
            <section className="border-t border-outline-variant/30 bg-surface-container-low py-16">
              <div className="mx-auto max-w-xl space-y-4 px-5 md:px-16">
                <Shimmer className="mx-auto h-8 w-48" />
                <Shimmer className="mx-auto h-12 w-full max-w-md rounded-lg" />
              </div>
            </section>
          }
        >
          <NewsletterSection />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}

export function HomePageContentWithFallback() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageContent />
    </Suspense>
  );
}
