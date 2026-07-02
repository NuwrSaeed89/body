"use client";

import { ImageWithShimmer } from "@/components/ui/image-with-shimmer";

type HeroBackgroundProps = {
  src: string;
  alt: string;
};

export function HeroBackground({ src, alt }: HeroBackgroundProps) {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 scale-[1.03] motion-safe:animate-[heroKenBurns_18s_ease-out_forwards]">
        <ImageWithShimmer
          src={src}
          alt={alt}
          fill
          priority
          quality={90}
          className="object-cover object-[center_20%] md:object-[65%_center]"
          sizes="100vw"
        />
      </div>
      <div
        className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/20 to-transparent md:bg-gradient-to-r md:from-primary/75 md:via-primary/30 md:to-transparent"
        aria-hidden
      />
    </div>
  );
}
