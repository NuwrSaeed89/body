"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Link } from "@/i18n/navigation";

const STORAGE_KEY = "mbody-coming-soon-emails";

export type LaunchCountdownLabels = {
  ariaLabel: string;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

export type LaunchContentLabels = {
  eyebrow: string;
  title: string;
  description: string;
  emailPlaceholder: string;
  notify: string;
  shopCollection: string;
  liveNow: string;
  success: string;
};

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isLive: boolean;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function getTimeLeft(targetIso: string): TimeLeft {
  const distance = new Date(targetIso).getTime() - Date.now();
  if (distance <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true };
  }
  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((distance % (1000 * 60)) / 1000),
    isLive: false,
  };
}

type ComingSoonLaunchContentProps = {
  targetIso: string;
  labels: LaunchContentLabels;
  countdown: LaunchCountdownLabels;
};

export function ComingSoonLaunchContent({
  targetIso,
  labels,
  countdown,
}: ComingSoonLaunchContentProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft(targetIso));
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const tick = () => setTimeLeft(getTimeLeft(targetIso));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetIso]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) return;

    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as string[];
      if (!existing.includes(trimmed)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, trimmed]));
      }
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([trimmed]));
    }

    setSubmitted(true);
    setEmail("");
  };

  const digitClass =
    "text-[48px] font-medium tracking-tight text-white countdown-shadow md:text-[100px]";
  const labelClass =
    "text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60 md:text-xs";
  const colonClass = `${digitClass} opacity-50`;

  return (
    <div className="relative z-20 flex w-full max-w-4xl flex-col items-center px-5 pb-28 pt-24 text-center md:px-16 md:pb-32 md:pt-28">
      <div className="mb-4">
        <span className="animate-pulse text-xs font-semibold uppercase tracking-[0.3em] text-white/90">
          {labels.eyebrow}
        </span>
      </div>

      <h1 className="mb-8 max-w-3xl text-[40px] font-medium leading-tight tracking-tighter text-white md:text-[80px]">
        {labels.title}
      </h1>

      {timeLeft.isLive ? (
        <span className="mb-12 text-[48px] font-medium text-white countdown-shadow md:text-[60px]">
          {labels.liveNow}
        </span>
      ) : (
        <div
          className="mb-12 flex gap-4 md:gap-12"
          aria-live="polite"
          aria-label={countdown.ariaLabel}
        >
          <div className="flex flex-col items-center">
            <span className={digitClass} suppressHydrationWarning>
              {pad(timeLeft.days)}
            </span>
            <span className={labelClass}>{countdown.days}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className={colonClass}>:</span>
          </div>
          <div className="flex flex-col items-center">
            <span className={digitClass} suppressHydrationWarning>
              {pad(timeLeft.hours)}
            </span>
            <span className={labelClass}>{countdown.hours}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className={colonClass}>:</span>
          </div>
          <div className="flex flex-col items-center">
            <span className={digitClass} suppressHydrationWarning>
              {pad(timeLeft.minutes)}
            </span>
            <span className={labelClass}>{countdown.minutes}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className={colonClass}>:</span>
          </div>
          <div className="flex flex-col items-center">
            <span className={digitClass} suppressHydrationWarning>
              {pad(timeLeft.seconds)}
            </span>
            <span className={labelClass}>{countdown.seconds}</span>
          </div>
        </div>
      )}

      <p className="mb-12 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
        {labels.description}
      </p>

      <div className="w-full max-w-md space-y-6">
        {submitted ? (
          <p
            className="rounded-lg border border-white/20 bg-white/10 px-6 py-4 text-sm text-white backdrop-blur-md"
            role="status"
          >
            {labels.success}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3 md:flex-row">
            <label className="sr-only" htmlFor="launch-email">
              {labels.emailPlaceholder}
            </label>
            <input
              id="launch-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={labels.emailPlaceholder}
              className="w-full flex-grow rounded-lg border border-white/20 bg-white/10 px-6 py-4 text-xs font-semibold uppercase tracking-[0.1em] text-white placeholder:text-white/40 backdrop-blur-md transition-all focus:outline-none focus:ring-1 focus:ring-white/50"
            />
            <button
              type="submit"
              className="whitespace-nowrap rounded-lg bg-white px-8 py-4 text-xs font-semibold uppercase tracking-[0.1em] text-primary transition-all hover:bg-white/90 active:scale-95"
            >
              {labels.notify}
            </button>
          </form>
        )}

        {timeLeft.isLive ? (
          <Link
            href="/shop"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-8 py-4 text-xs font-semibold uppercase tracking-[0.1em] text-primary transition-all hover:bg-primary-fixed"
          >
            <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
            {labels.shopCollection}
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="group flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-white/20 px-8 py-4 text-xs font-semibold uppercase tracking-[0.1em] text-white/30"
          >
            <span className="material-symbols-outlined text-[20px]">lock</span>
            {labels.shopCollection}
          </button>
        )}
      </div>
    </div>
  );
}
