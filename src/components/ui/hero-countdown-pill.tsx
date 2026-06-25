"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type HeroCountdownPillProps = {
  targetIso: string;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatCountdown(targetIso: string): string {
  const distance = Math.max(0, new Date(targetIso).getTime() - Date.now());
  const hours = Math.floor(distance / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function HeroCountdownPill({ targetIso }: HeroCountdownPillProps) {
  const t = useTranslations("hero");
  const [value, setValue] = useState("00:00:00");

  useEffect(() => {
    const update = () => setValue(formatCountdown(targetIso));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetIso]);

  return (
    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 backdrop-blur-md">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
      <span className="text-[10px] font-semibold uppercase tracking-widest">
        {t("nextDrop")}:{" "}
        <span suppressHydrationWarning>{value}</span>
      </span>
    </div>
  );
}
