"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";
import { Shimmer } from "./shimmer";

type ImageWithShimmerProps = ImageProps & {
  shimmerClassName?: string;
};

export function ImageWithShimmer({
  className = "",
  shimmerClassName = "",
  onLoad,
  ...props
}: ImageWithShimmerProps) {
  const [loaded, setLoaded] = useState(false);
  const startedAtRef = useRef<number>(Date.now());

  const srcKey =
    typeof props.src === "string"
      ? props.src
      : // StaticImport
        (props.src as { src: string }).src;

  // Reset shimmer state when Next/Image `src` changes.
  useEffect(() => {
    startedAtRef.current = Date.now();
    setLoaded(false);
  }, [srcKey]);

  return (
    <div className="relative h-full w-full">
      {!loaded && (
        <Shimmer
          className={`absolute inset-0 z-[1] rounded-none ${shimmerClassName}`}
        />
      )}
      <Image
        {...props}
        className={`${className} ${loaded ? "opacity-100" : "opacity-0"} transition-opacity duration-500`}
        onLoad={(event) => {
          // Ensure users can visually perceive shimmer even if image is already cached.
          const minVisibleMs = 120;
          const elapsed = Date.now() - startedAtRef.current;
          const remaining = minVisibleMs - elapsed;
          if (remaining > 0) {
            window.setTimeout(() => setLoaded(true), remaining);
          } else {
            setLoaded(true);
          }
          onLoad?.(event);
        }}
      />
    </div>
  );
}
