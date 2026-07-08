import {
  formatProductImageFormatsLabel,
  isAllowedProductImageFile,
  PRODUCT_IMAGE_MAX_BYTES,
} from "@/lib/admin/products/image-formats";
import { isUploadAbortError, uploadWithProgress } from "@/lib/admin/products/upload-with-progress";

export type ProductImageItem = {
  id: string;
  publicUrl: string;
  fileName: string;
  isPrimary: boolean;
  sortOrder: number;
};

export type ProductImageUploadResult = {
  id: string;
  storagePath: string;
  publicUrl: string;
  fileName: string;
  isPrimary: boolean;
  sortOrder: number;
};

type UploadProductImageOptions = {
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
  image?: ProductImageUploadResult;
  error?: string;
};

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Upload cancelled", "AbortError");
  }
}

export async function uploadProductImage({
  productId,
  file,
  onProgress,
  signal,
}: UploadProductImageOptions): Promise<ProductImageUploadResult> {
  if (!isAllowedProductImageFile(file)) {
    throw new Error(
      `Invalid file. Use ${formatProductImageFormatsLabel()} up to ${Math.round(PRODUCT_IMAGE_MAX_BYTES / 1024 / 1024)} MB.`,
    );
  }

  throwIfAborted(signal);
  onProgress?.(0);

  const sessionResponse = await fetch(`/api/admin/products/${productId}/images/upload-url`, {
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

  const registerResponse = await fetch(`/api/admin/products/${productId}/images`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      storagePath: session.storagePath,
      publicUrl: session.publicUrl,
    }),
    signal,
  });

  const registered = (await registerResponse.json()) as RegisterResponse;
  if (!registerResponse.ok || !registered.image) {
    throw new Error(registered.error ?? "Could not save image to product");
  }

  onProgress?.(100);
  return registered.image;
}

export async function deleteProductImage(productId: string, mediaId: string): Promise<void> {
  const response = await fetch(`/api/admin/products/${productId}/images/${mediaId}`, {
    method: "DELETE",
  });
  const body = (await response.json()) as { error?: string };
  if (!response.ok) {
    throw new Error(body.error ?? "Could not delete image");
  }
}

export async function setPrimaryProductImage(productId: string, mediaId: string): Promise<ProductImageItem> {
  const response = await fetch(`/api/admin/products/${productId}/images/${mediaId}`, {
    method: "PATCH",
  });
  const body = (await response.json()) as { image?: ProductImageItem; error?: string };
  if (!response.ok || !body.image) {
    throw new Error(body.error ?? "Could not set primary image");
  }
  return body.image;
}

export { isUploadAbortError };
