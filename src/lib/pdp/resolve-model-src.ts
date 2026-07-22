const ALLOWED_MODEL_HOSTS = [
  ".supabase.co",
  "modelviewer.dev",
] as const;

/** Same-origin proxy avoids CORS / content-type issues with storage GLBs. */
export function resolveModelViewerSrc(src: string): string {
  const trimmed = src.trim();
  if (!trimmed) return trimmed;

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:") return trimmed;

    const allowed = ALLOWED_MODEL_HOSTS.some((host) =>
      host.startsWith(".")
        ? url.hostname.endsWith(host)
        : url.hostname === host,
    );

    if (allowed) {
      return `/api/models/proxy?url=${encodeURIComponent(trimmed)}`;
    }
  } catch {
    return trimmed;
  }

  return trimmed;
}
