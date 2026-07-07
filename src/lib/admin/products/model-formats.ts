export const PRODUCT_MODEL_BUCKET = "product-media";

/** Extensions supported by @google/model-viewer on the storefront. */
export const PRODUCT_MODEL_EXTENSIONS = [".glb", ".gltf", ".usdz"] as const;

export type ProductModelExtension = (typeof PRODUCT_MODEL_EXTENSIONS)[number];

export const PRODUCT_MODEL_MAX_BYTES = 52_428_800; // 50 MB — matches storage bucket limit

const EXTENSION_MIME: Record<ProductModelExtension, string> = {
  ".glb": "model/gltf-binary",
  ".gltf": "model/gltf+json",
  ".usdz": "model/vnd.usdz+zip",
};

/**
 * Value for `<input accept>` — extensions + MIME types.
 * Browsers (especially Safari/macOS) grey out .glb if only extensions are listed.
 */
export const PRODUCT_MODEL_ACCEPT = [
  ...PRODUCT_MODEL_EXTENSIONS,
  ...Object.values(EXTENSION_MIME),
  "model/*",
  "application/octet-stream",
].join(",");

export function getProductModelExtension(fileName: string): ProductModelExtension | null {
  const lower = fileName.toLowerCase();
  for (const ext of PRODUCT_MODEL_EXTENSIONS) {
    if (lower.endsWith(ext)) return ext;
  }
  return null;
}

export function getProductModelMimeType(fileName: string): string {
  const ext = getProductModelExtension(fileName);
  if (ext) return EXTENSION_MIME[ext];
  return "application/octet-stream";
}

export function isAllowedProductModelFile(file: File): boolean {
  if (file.size <= 0 || file.size > PRODUCT_MODEL_MAX_BYTES) return false;
  return getProductModelExtension(file.name) !== null;
}

export function buildProductModelStoragePath(productSlug: string, fileName: string): string {
  const ext = getProductModelExtension(fileName) ?? ".glb";
  const safeSlug = productSlug.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  const stamp = Date.now();
  return `products/${safeSlug}/model-${stamp}${ext}`;
}

export function buildProductModelPublicUrl(supabaseUrl: string, storagePath: string): string {
  const base = supabaseUrl.replace(/\/$/, "");
  const encodedPath = storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${base}/storage/v1/object/public/${PRODUCT_MODEL_BUCKET}/${encodedPath}`;
}

export function formatProductModelFormatsLabel(): string {
  return PRODUCT_MODEL_EXTENSIONS.map((ext) => ext.slice(1).toUpperCase()).join(", ");
}
