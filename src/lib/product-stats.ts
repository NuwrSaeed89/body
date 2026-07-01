/** Denormalized engagement counters (mirrors public.products columns). */
export type ProductStats = {
  viewCount: number;
  likeCount: number;
  waitingCount: number;
  unitsSold: number;
};

export const PDP_VIEW_SESSION_PREFIX = "mbody-pdp-view:";

export function formatEngagementCount(value: number): string {
  if (value >= 10_000) {
    const rounded = Math.floor(value / 1_000) * 1_000;
    return `${rounded.toLocaleString("en-US")}+`;
  }
  if (value >= 1_000) {
    return `${value.toLocaleString("en-US")}`;
  }
  return String(value);
}

export function getOrCreateBrowserSessionId(): string {
  if (typeof window === "undefined") return "";
  const storageKey = "mbody-browser-session";
  let id = sessionStorage.getItem(storageKey);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `sess-${Date.now()}`;
    sessionStorage.setItem(storageKey, id);
  }
  return id;
}

export function hasRecordedPdpView(slug: string): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(`${PDP_VIEW_SESSION_PREFIX}${slug}`) === "1";
}

export function markPdpViewRecorded(slug: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(`${PDP_VIEW_SESSION_PREFIX}${slug}`, "1");
}
