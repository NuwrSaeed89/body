/**
 * Whether next/image should skip the optimizer for this src.
 * Local `/…` assets and allowlisted remotes (see next.config) stay optimized.
 */
const OPTIMIZABLE_REMOTE_HOSTS = [
  "lh3.googleusercontent.com",
  "supabase.co",
] as const;

export function shouldSkipImageOptimization(src: string): boolean {
  if (!src.startsWith("http://") && !src.startsWith("https://")) {
    return false;
  }

  try {
    const { hostname } = new URL(src);
    return !OPTIMIZABLE_REMOTE_HOSTS.some(
      (host) => hostname === host || hostname.endsWith(`.${host}`),
    );
  } catch {
    return true;
  }
}
