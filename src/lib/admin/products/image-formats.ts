export const PRODUCT_IMAGE_BUCKET = "product-media";

export const PRODUCT_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"] as const;

export type ProductImageExtension = (typeof PRODUCT_IMAGE_EXTENSIONS)[number];

export const PRODUCT_IMAGE_MAX_BYTES = 10_485_760; // 10 MB

const EXTENSION_MIME: Record<ProductImageExtension, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export const PRODUCT_IMAGE_ACCEPT = [
  ...PRODUCT_IMAGE_EXTENSIONS,
  ...Object.values(EXTENSION_MIME),
  "image/*",
].join(",");

export function getProductImageExtension(fileName: string): ProductImageExtension | null {
  const lower = fileName.toLowerCase();
  for (const ext of PRODUCT_IMAGE_EXTENSIONS) {
    if (lower.endsWith(ext)) return ext;
  }
  return null;
}

export function getProductImageMimeType(fileName: string): string {
  const ext = getProductImageExtension(fileName);
  if (ext) return EXTENSION_MIME[ext];
  return "image/jpeg";
}

export function isAllowedProductImageFile(file: File): boolean {
  if (file.size <= 0 || file.size > PRODUCT_IMAGE_MAX_BYTES) return false;
  if (getProductImageExtension(file.name)) return true;
  return file.type.startsWith("image/");
}

export function buildProductImageStoragePath(productSlug: string, fileName: string): string {
  const safeSlug = productSlug.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  const ext = getProductImageExtension(fileName) ?? ".webp";
  const stamp = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `products/${safeSlug}/image-${stamp}-${rand}${ext}`;
}

export function buildProductImagePublicUrl(supabaseUrl: string, storagePath: string): string {
  const base = supabaseUrl.replace(/\/$/, "");
  const encodedPath = storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${base}/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/${encodedPath}`;
}

export function formatProductImageFormatsLabel(): string {
  return "JPG, PNG, WebP";
}

export function isManagedProductImageStoragePath(storagePath: string): boolean {
  return storagePath.startsWith("products/");
}
