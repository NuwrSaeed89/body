export const ADMIN_FULFILLMENT_STATUSES = [
  "processing",
  "shipped",
  "delivered",
  "returned",
] as const;

export type AdminFulfillmentStatus = (typeof ADMIN_FULFILLMENT_STATUSES)[number];

/** Orders that can move through fulfillment status updates. */
export const ADMIN_STATUS_UPDATABLE_FROM = new Set([
  "paid",
  "processing",
  "shipped",
  "delivered",
  "returned",
]);
