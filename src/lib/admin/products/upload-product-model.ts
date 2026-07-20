import {
  checkProductModelFile,
  getProductModelExtension,
  rejectReasonLabel,
} from "@/lib/admin/products/model-formats";
import { isUploadAbortError, uploadWithProgress } from "@/lib/admin/products/upload-with-progress";

export type ProductModelUploadResult = {
  storagePath: string;
  publicUrl: string;
  fileName: string;
};

type UploadProductModelOptions = {
  productId: string;
  file: File;
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
};

type UploadUrlResponse = {
  storagePath: string;
  publicUrl: string;
  signedUrl: string;
  token: string;
  contentType: string;
  error?: string;
};

type RegisterResponse = {
  model?: ProductModelUploadResult;
  error?: string;
};

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Upload cancelled", "AbortError");
  }
}

async function prepareGlbForUpload(
  file: File,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal,
): Promise<File> {
  throwIfAborted(signal);
  onProgress?.(1);

  const { optimizeGlbFile } = await import("./optimize-glb-client");
  throwIfAborted(signal);

  const result = await optimizeGlbFile(file, (optimizePercent) => {
    // Reserve 0–45% of total progress for in-browser optimization.
    onProgress?.(Math.max(1, Math.round(optimizePercent * 0.45)));
  });

  throwIfAborted(signal);

  if (result.didOptimize) {
    console.info(
      `[admin] GLB optimized in browser: ${result.originalBytes} → ${result.optimizedBytes} bytes`,
    );
  }

  return result.file;
}

export async function uploadProductModel({
  productId,
  file,
  onProgress,
  signal,
}: UploadProductModelOptions): Promise<ProductModelUploadResult> {
  const rejection = checkProductModelFile(file);
  if (rejection) {
    throw new Error(rejectReasonLabel(rejection));
  }

  let uploadFile = file;
  let alreadyOptimized = false;

  if (getProductModelExtension(file.name) === ".glb") {
    uploadFile = await prepareGlbForUpload(file, onProgress, signal);
    alreadyOptimized = true;
  }

  throwIfAborted(signal);
  onProgress?.(alreadyOptimized ? 46 : 0);

  const sessionResponse = await fetch(`/api/admin/products/${productId}/model/upload-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: uploadFile.name,
      fileSize: uploadFile.size,
      contentType: uploadFile.type || undefined,
    }),
    signal,
  });

  throwIfAborted(signal);

  const session = (await sessionResponse.json()) as UploadUrlResponse;
  if (!sessionResponse.ok) {
    throw new Error(session.error ?? "Could not start upload");
  }

  try {
    await uploadWithProgress({
      url: session.signedUrl,
      method: "PUT",
      file: uploadFile,
      headers: {
        "Content-Type": session.contentType,
        Authorization: `Bearer ${session.token}`,
        "x-upsert": "true",
      },
      signal,
      onProgress: (percent) => {
        const base = alreadyOptimized ? 46 : 5;
        const span = alreadyOptimized ? 49 : 90;
        onProgress?.(base + Math.round(percent * (span / 100)));
      },
    });
  } catch (error) {
    if (isUploadAbortError(error)) throw error;
    throw error;
  }

  throwIfAborted(signal);
  onProgress?.(alreadyOptimized ? 96 : 95);

  const registerResponse = await fetch(`/api/admin/products/${productId}/model`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      storagePath: session.storagePath,
      publicUrl: session.publicUrl,
      alreadyOptimized,
    }),
    signal,
  });

  const registered = (await registerResponse.json()) as RegisterResponse;
  if (!registerResponse.ok || !registered.model) {
    throw new Error(registered.error ?? "Could not save model to product");
  }

  onProgress?.(100);
  return registered.model;
}

export async function deleteProductModel(productId: string): Promise<void> {
  const response = await fetch(`/api/admin/products/${productId}/model`, { method: "DELETE" });
  const body = (await response.json()) as { error?: string };
  if (!response.ok) {
    throw new Error(body.error ?? "Could not delete model");
  }
}

export async function registerProductModelUrl(
  productId: string,
  publicUrl: string,
): Promise<ProductModelUploadResult> {
  const response = await fetch(`/api/admin/products/${productId}/model`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publicUrl: publicUrl.trim() }),
  });

  const body = (await response.json()) as RegisterResponse;
  if (!response.ok || !body.model) {
    throw new Error(body.error ?? "Could not save model URL");
  }

  return body.model;
}

export { isUploadAbortError };
