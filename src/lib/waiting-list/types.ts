export type StockNotificationRecord = {
  id: string;
  email: string;
  productId: string;
  slug: string;
  variantId: string | null;
  size: string | null;
  color: string | null;
  userId: string | null;
  createdAt: string;
};

export type SubscribeStockNotificationInput = {
  email: string;
  productId: string;
  slug: string;
  variantId?: string | null;
  size?: string | null;
  color?: string | null;
  userId?: string | null;
};

export type SubscribeStockNotificationResult = {
  ok: boolean;
  alreadySubscribed: boolean;
  waitingCount: number;
  error?: string;
};
