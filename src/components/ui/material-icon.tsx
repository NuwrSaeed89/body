"use client";

import { useEffect, useState } from "react";
import { ShimmerIcon } from "@/components/ui/shimmer";

type MaterialIconProps = {
  name: string;
  className?: string;
};

/** Shows a circular shimmer until Material Symbols font is ready. */
export function MaterialIcon({ name, className = "" }: MaterialIconProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (document.fonts?.check?.('24px "Material Symbols Outlined"')) {
      setReady(true);
      return;
    }
    document.fonts?.ready
      .then(() => setReady(true))
      .catch(() => setReady(true));
  }, []);

  return (
    <span className={`relative inline-flex size-6 items-center justify-center ${className}`}>
      {!ready && <ShimmerIcon className="absolute inset-0 size-full" />}
      <span
        className={`material-symbols-outlined transition-opacity duration-300 ${
          ready ? "opacity-100" : "opacity-0"
        }`}
      >
        {name}
      </span>
    </span>
  );
}
