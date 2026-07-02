"use client";

import { useEffect, useState } from "react";

type HomeInitialLoaderProps = {
  onComplete: () => void;
};

const MIN_VISIBLE_MS = 600;
const TICK_MS = 50;

export function HomeInitialLoader({ onComplete }: HomeInitialLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const startedAt = Date.now();
    let current = 0;
    let fontsReady = false;
    let pageReady = document.readyState === "complete";

    const finish = () => {
      setProgress(100);
      setExiting(true);
      window.setTimeout(onComplete, 320);
    };

    const tryFinish = () => {
      if (current >= 100 && fontsReady && pageReady) {
        const elapsed = Date.now() - startedAt;
        const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
        window.setTimeout(finish, wait);
      }
    };

    const onWindowLoad = () => {
      pageReady = true;
      tryFinish();
    };

    if (pageReady) onWindowLoad();
    else window.addEventListener("load", onWindowLoad, { once: true });

    document.fonts?.ready
      .then(() => {
        fontsReady = true;
        tryFinish();
      })
      .catch(() => {
        fontsReady = true;
        tryFinish();
      });

    const interval = window.setInterval(() => {
      if (current >= 100) {
        clearInterval(interval);
        tryFinish();
        return;
      }

      const step = current < 55 ? 9 : current < 85 ? 5 : current < 95 ? 2 : 1;
      current = Math.min(100, current + step);
      setProgress(current);

      if (current >= 100) {
        clearInterval(interval);
        tryFinish();
      }
    }, TICK_MS);

    return () => {
      clearInterval(interval);
      window.removeEventListener("load", onWindowLoad);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[300] flex flex-col items-center justify-center bg-surface transition-opacity duration-300 ${
        exiting ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Loading Mbody"
    >
      <p className="mb-10 text-3xl font-medium tracking-tighter text-primary md:text-4xl">
        Mbody
      </p>

      <div className="w-[min(280px,72vw)]">
        <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
          <span>Loading</span>
          <span suppressHydrationWarning>{progress}%</span>
        </div>
        <div className="h-[2px] w-full overflow-hidden rounded-full bg-surface-container-high">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
