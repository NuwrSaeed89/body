import type { ProductRatingRecord, ProductRatingSummary } from "./types";

type MockStoreGlobal = typeof globalThis & {
  __mbodyProductRatings?: ProductRatingRecord[];
};

/** Seeded totals before live user submissions (catalog engagement baseline). */
const BASE_RATING_TOTALS: Record<string, { totalStars: number; count: number }> = {
  "sculpt-leggings": { totalStars: 856, count: 186 },
  "zen-flow-bra": { totalStars: 639, count: 142 },
  "essence-seamless-top": { totalStars: 448, count: 98 },
  "terra-ribbed-shorts": { totalStars: 342, count: 76 },
  "power-set": { totalStars: 531, count: 118 },
  "aero-flow-leggings": { totalStars: 738, count: 164 },
  "elite-bra": { totalStars: 301, count: 67 },
  "performance-headband": { totalStars: 153, count: 34 },
};

const DEFAULT_BASE = { totalStars: 320, count: 64 };

function getStore(): ProductRatingRecord[] {
  const g = globalThis as MockStoreGlobal;
  if (!g.__mbodyProductRatings) {
    g.__mbodyProductRatings = [];
  }
  return g.__mbodyProductRatings;
}

function getBaseTotals(productId: string) {
  return BASE_RATING_TOTALS[productId] ?? DEFAULT_BASE;
}

export function getProductRatingSummary(productId: string): ProductRatingSummary {
  const rows = getStore().filter((row) => row.productId === productId);
  const base = getBaseTotals(productId);
  const totalStars = base.totalStars + rows.reduce((sum, row) => sum + row.stars, 0);
  const count = base.count + rows.length;
  return {
    average: count > 0 ? Math.round((totalStars / count) * 10) / 10 : 0,
    count,
  };
}

export function getUserProductRating(
  userId: string,
  productId: string,
): ProductRatingRecord | undefined {
  return getStore().find((row) => row.userId === userId && row.productId === productId);
}

export function addMockProductRating(
  input: Omit<ProductRatingRecord, "id" | "createdAt">,
): { record: ProductRatingRecord; alreadyRated: boolean } {
  const store = getStore();
  const existing = store.find(
    (row) => row.userId === input.userId && row.productId === input.productId,
  );
  if (existing) {
    return { record: existing, alreadyRated: true };
  }

  const record: ProductRatingRecord = {
    ...input,
    id: `pr_${crypto.randomUUID()}`,
    createdAt: new Date().toISOString(),
  };
  store.push(record);
  return { record, alreadyRated: false };
}
