"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type CountdownTimerProps = {
  targetIso: string;
  variant?: "hero" | "compact" | "launch";
  className?: string;
};

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const PLACEHOLDER: TimeLeft = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
};

function getTimeLeft(targetIso: string): TimeLeft {
  const distance = Math.max(0, new Date(targetIso).getTime() - Date.now());
  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((distance % (1000 * 60)) / 1000),
  };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function CountdownTimer({
  targetIso,
  variant = "hero",
  className = "",
}: CountdownTimerProps) {
  const t = useTranslations("countdown");
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(PLACEHOLDER);

  useEffect(() => {
    const update = () => setTimeLeft(getTimeLeft(targetIso));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetIso]);

  const isLarge = variant === "hero" || variant === "launch";
  const digitClass =
    variant === "launch"
      ? "text-[48px] md:text-[100px] font-medium tracking-tight text-white countdown-shadow"
      : isLarge
        ? "text-[40px] md:text-[64px] font-medium tracking-tight text-white timer-glow"
        : "text-3xl md:text-5xl font-medium tracking-tight text-white timer-glow";
  const labelClass =
    variant === "launch"
      ? "text-[10px] md:text-xs font-semibold uppercase tracking-[0.2em] text-white/60"
      : "text-[10px] md:text-xs font-semibold uppercase tracking-[0.2em] text-on-primary-container/60";
  const separatorClass = `${digitClass} opacity-50`;

  const units: Array<{ value: number; label: string }> = [
    { value: timeLeft.days, label: t("days") },
    { value: timeLeft.hours, label: t("hours") },
    { value: timeLeft.minutes, label: t("minutes") },
    { value: timeLeft.seconds, label: t("seconds") },
  ];

  return (
    <div
      className={`flex items-center gap-3 md:gap-8 ${className}`}
      aria-live="polite"
      aria-label={t("ariaLabel")}
    >
      {units.map((unit, index) => (
        <div key={unit.label} className="flex items-center gap-3 md:gap-8">
          {index > 0 && <span className={separatorClass}>:</span>}
          <div className="flex flex-col items-center">
            <span className={digitClass} suppressHydrationWarning>
              {pad(unit.value)}
            </span>
            <span className={labelClass}>{unit.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
