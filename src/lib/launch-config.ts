/** Public launch timestamp (ISO 8601). Default: ~40 days from initial setup. */
export const LAUNCH_AT_ISO =
  process.env.NEXT_PUBLIC_LAUNCH_AT ?? "2026-08-09T16:00:00.000Z";

const COMING_SOON_FLAG = process.env.NEXT_PUBLIC_COMING_SOON;
const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV;

/**
 * When false, the full storefront is always available.
 * Unset locally → off in development, on in staging/production.
 */
export function isComingSoonEnabled(): boolean {
  if (COMING_SOON_FLAG === "false") return false;
  if (COMING_SOON_FLAG === "true") return true;
  return APP_ENV === "staging" || APP_ENV === "production";
}

/** True while coming soon is enabled and the launch date has not passed. */
export function isComingSoonActive(now = Date.now()): boolean {
  if (!isComingSoonEnabled()) return false;
  return now < new Date(LAUNCH_AT_ISO).getTime();
}

export function daysUntilLaunch(now = Date.now()): number {
  const distance = new Date(LAUNCH_AT_ISO).getTime() - now;
  if (distance <= 0) return 0;
  return Math.ceil(distance / (1000 * 60 * 60 * 24));
}
