export const PRODUCT_MODEL_BUCKET = "product-media";

/** Extensions supported by @google/model-viewer on the storefront. */
export const PRODUCT_MODEL_EXTENSIONS = [".glb", ".gltf", ".usdz"] as const;

export type ProductModelExtension = (typeof PRODUCT_MODEL_EXTENSIONS)[number];

/** Final stored model size (Supabase bucket limit). */
export const PRODUCT_MODEL_MAX_BYTES = 52_428_800; // 50 MB

/** Raw .glb upload limit — larger files are auto-optimized before storage. */
export const PRODUCT_MODEL_UPLOAD_MAX_BYTES = 104_857_600; // 100 MB

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

export type ModelFileRejectionReason = "extension" | "too_large" | "empty";

export function getProductModelUploadMaxBytes(fileName: string): number {
  return getProductModelExtension(fileName) === ".glb"
    ? PRODUCT_MODEL_UPLOAD_MAX_BYTES
    : PRODUCT_MODEL_MAX_BYTES;
}

export function checkProductModelFile(file: File): ModelFileRejectionReason | null {
  if (getProductModelExtension(file.name) === null) return "extension";
  if (file.size > getProductModelUploadMaxBytes(file.name)) return "too_large";
  if (file.size === 0) return "empty";
  return null;
}

export function isAllowedProductModelFile(file: File): boolean {
  return checkProductModelFile(file) === null;
}

export function rejectReasonLabel(reason: ModelFileRejectionReason): string {
  if (reason === "extension")
    return `Unsupported format. Use ${formatProductModelFormatsLabel()} (e.g. product.glb).`;
  if (reason === "too_large")
    return `File is too large. GLB uploads up to ${Math.round(PRODUCT_MODEL_UPLOAD_MAX_BYTES / 1024 / 1024)} MB are auto-optimized; other formats max ${Math.round(PRODUCT_MODEL_MAX_BYTES / 1024 / 1024)} MB.`;
  return "File appears to be empty. Try exporting the model again.";
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

export const EXTERNAL_MODEL_STORAGE_PREFIX = "external/";

export function isExternalProductModelStoragePath(storagePath: string): boolean {
  return storagePath.startsWith(EXTERNAL_MODEL_STORAGE_PREFIX);
}

export function isAllowedProductModelUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
    return getProductModelExtension(parsed.pathname) !== null;
  } catch {
    return false;
  }
}

export function fileNameFromModelUrl(url: string): string {
  try {
    const segment = new URL(url).pathname.split("/").pop() ?? "model.glb";
    return decodeURIComponent(segment) || "model.glb";
  } catch {
    return "model.glb";
  }
}

export function buildExternalProductModelStoragePath(productSlug: string, url: string): string {
  const safeSlug = productSlug.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  const ext = getProductModelExtension(fileNameFromModelUrl(url)) ?? ".glb";
  const stamp = Date.now();
  return `${EXTERNAL_MODEL_STORAGE_PREFIX}${safeSlug}/model-${stamp}${ext}`;
}
