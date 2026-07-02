"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

type ComingSoonHeroBackgroundProps = {
  src: string;
  alt: string;
};

export function ComingSoonHeroBackground({ src, alt }: ComingSoonHeroBackgroundProps) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const amount = 20;
      const x = (event.clientX / window.innerWidth - 0.5) * amount;
      const y = (event.clientY / window.innerHeight - 0.5) * amount;
      wrap.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 z-0 scale-105 transition-transform duration-[10000ms] ease-out">
      <div ref={wrapRef} className="absolute inset-0 will-change-transform">
        <div className="absolute inset-0 z-10 bg-primary/20 luxury-gradient" />
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          priority
          sizes="100vw"
          unoptimized={src.startsWith("http")}
        />
      </div>
    </div>
  );
}
