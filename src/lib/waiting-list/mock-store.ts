import type { StockNotificationRecord } from "./types";
import { subscriptionDedupeKey } from "./variant-key";

type MockStoreGlobal = typeof globalThis & {
  __mbodyStockNotifications?: StockNotificationRecord[];
};

function getStore(): StockNotificationRecord[] {
  const g = globalThis as MockStoreGlobal;
  if (!g.__mbodyStockNotifications) {
    g.__mbodyStockNotifications = [];
  }
  return g.__mbodyStockNotifications;
}

export function countWaitingForProduct(productId: string): number {
  const unique = new Set(
    getStore()
      .filter((row) => row.productId === productId)
      .map((row) => subscriptionDedupeKey(row.productId, row.variantId, row.email)),
  );
  return unique.size;
}

export function listMockStockNotifications(): StockNotificationRecord[] {
  return [...getStore()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function addMockStockNotification(
  input: Omit<StockNotificationRecord, "id" | "createdAt">,
): { record: StockNotificationRecord; alreadySubscribed: boolean } {
  const store = getStore();
  const dedupe = subscriptionDedupeKey(input.productId, input.variantId, input.email);
  const existing = store.find(
    (row) =>
      subscriptionDedupeKey(row.productId, row.variantId, row.email) === dedupe,
  );
  if (existing) {
    return { record: existing, alreadySubscribed: true };
  }

  const record: StockNotificationRecord = {
    ...input,
    id: `sn_${crypto.randomUUID()}`,
    createdAt: new Date().toISOString(),
  };
  store.push(record);
  return { record, alreadySubscribed: false };
}
