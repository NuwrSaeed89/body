export const ADMIN_MEDIA_BUCKET = "product-media";

export const ADMIN_MEDIA_BUCKETS = [ADMIN_MEDIA_BUCKET] as const;

export type AdminMediaBucket = (typeof ADMIN_MEDIA_BUCKETS)[number];
