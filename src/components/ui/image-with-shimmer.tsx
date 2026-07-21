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
  onLoadingComplete,
  fill,
  ...props
}: ImageWithShimmerProps) {
  const [loaded, setLoaded] = useState(false);
  const startedAtRef = useRef<number>(Date.now());
  const revealTimeoutRef = useRef<number | null>(null);

  const srcKey =
    typeof props.src === "string"
      ? props.src
      : // StaticImport
        (props.src as { src: string }).src;

  const reveal = () => {
    if (revealTimeoutRef.current !== null) {
      window.clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }

    const minVisibleMs = 120;
    const elapsed = Date.now() - startedAtRef.current;
    const remaining = minVisibleMs - elapsed;

    if (remaining > 0) {
      revealTimeoutRef.current = window.setTimeout(() => {
        setLoaded(true);
        revealTimeoutRef.current = null;
      }, remaining);
    } else {
      setLoaded(true);
    }
  };

  // Reset shimmer when Next/Image `src` changes.
  useEffect(() => {
    startedAtRef.current = Date.now();
    setLoaded(false);
    return () => {
      if (revealTimeoutRef.current !== null) {
        window.clearTimeout(revealTimeoutRef.current);
        revealTimeoutRef.current = null;
      }
    };
  }, [srcKey]);

  return (
    <div
      className={
        fill
          ? "absolute inset-0"
          : "relative h-full w-full"
      }
    >
      {!loaded && (
        <Shimmer
          className={`absolute inset-0 z-[1] rounded-none ${shimmerClassName}`}
        />
      )}
      <Image
        {...props}
        fill={fill}
        className={`${className} ${loaded ? "opacity-100" : "opacity-0"} transition-opacity duration-500`}
        onLoad={(event) => {
          reveal();
          onLoad?.(event);
        }}
        onLoadingComplete={(img) => {
          // Cached images may skip a reliable onLoad after remount — this catches them.
          reveal();
          onLoadingComplete?.(img);
        }}
      />
    </div>
  );
}
