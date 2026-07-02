"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
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
          setLoaded(true);
          onLoad?.(event);
        }}
      />
    </div>
  );
}
