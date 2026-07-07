import {
  formatProductModelFormatsLabel,
  isAllowedProductModelFile,
  PRODUCT_MODEL_MAX_BYTES,
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

export async function uploadProductModel({
  productId,
  file,
  onProgress,
  signal,
}: UploadProductModelOptions): Promise<ProductModelUploadResult> {
  if (!isAllowedProductModelFile(file)) {
    throw new Error(
      `Invalid file. Use ${formatProductModelFormatsLabel()} up to ${Math.round(PRODUCT_MODEL_MAX_BYTES / 1024 / 1024)} MB.`,
    );
  }

  throwIfAborted(signal);
  onProgress?.(0);

  const sessionResponse = await fetch(`/api/admin/products/${productId}/model/upload-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type || undefined,
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
      file,
      headers: {
        "Content-Type": session.contentType,
        Authorization: `Bearer ${session.token}`,
        "x-upsert": "true",
      },
      signal,
      onProgress: (percent) => {
        const mapped = 5 + Math.round(percent * 0.9);
        onProgress?.(mapped);
      },
    });
  } catch (error) {
    if (isUploadAbortError(error)) throw error;
    throw error;
  }

  throwIfAborted(signal);

  const registerResponse = await fetch(`/api/admin/products/${productId}/model`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      storagePath: session.storagePath,
      publicUrl: session.publicUrl,
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

export { isUploadAbortError };
