import type { CSSProperties, ReactNode } from "react";

type ShimmerProps = {
  className?: string;
  style?: CSSProperties;
};

export function Shimmer({ className = "", style }: ShimmerProps) {
  return <div className={`soft-shimmer rounded ${className}`} style={style} aria-hidden />;
}

/** Circular shimmer for header / nav icons while fonts load. */
export function ShimmerIcon({ className = "" }: ShimmerProps) {
  return <Shimmer className={`size-6 shrink-0 rounded-full ${className}`} />;
}

export function ShimmerText({ className = "" }: ShimmerProps) {
  return <Shimmer className={`h-3 ${className}`} />;
}

type ShimmerBoxProps = {
  className?: string;
  children?: ReactNode;
};

/** Aspect-ratio image placeholder with shimmer until content is ready. */
export function ShimmerBox({ className = "", children }: ShimmerBoxProps) {
  return (
    <div className={`relative overflow-hidden bg-surface-container-low ${className}`}>
      <Shimmer className="absolute inset-0 rounded-none" />
      {children}
    </div>
  );
}
