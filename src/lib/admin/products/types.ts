import type { ProductCurrency, ProductStatus } from "./constants";

export type ProductWriteInput = {
  slug: string;
  name: string;
  description?: string | null;
  status: ProductStatus;
  basePrice: number;
  compareAtPrice?: number | null;
  currency?: ProductCurrency;
  stock: number;
  isLatestDrop: boolean;
  isPremium: boolean;
  isBestSeller: boolean;
  isTemporarilyUnavailable: boolean;
  lowStockThreshold?: number;
  locale?: string;
  categoryId?: string | null;
};

export type ProductDetail = ProductWriteInput & {
  id: string;
  categorySlug?: string | null;
  categoryName?: string | null;
};
