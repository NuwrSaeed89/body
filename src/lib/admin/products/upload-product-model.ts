import {
  checkProductModelFile,
  getProductModelExtension,
  rejectReasonLabel,
} from "@/lib/admin/products/model-formats";
import { isUploadAbortError, uploadWithProgress } from "@/lib/admin/products/upload-with-progress";
import type { GlbOptimizePhase } from "@/lib/admin/products/optimize-glb-client";

export type ProductModelUploadResult = {
  storagePath: string;
  publicUrl: string;
  fileName: string;
  originalBytes?: number;
  optimizedBytes?: number;
  savedPercent?: number;
};

export type ProductModelUploadProgress = {
  percent: number;
  phase: "compressing" | "uploading" | "saving" | "done";
  label: string;
  originalBytes?: number;
  optimizedBytes?: number;
  savedPercent?: number;
};

type UploadProductModelOptions = {
  productId: string;
  file: File;
  onProgress?: (progress: ProductModelUploadProgress) => void;
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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function mapOptimizePhase(phase: GlbOptimizePhase): string {
  switch (phase) {
    case "loading":
      return "Loading compression tools…";
    case "reading":
      return "Reading GLB…";
    case "simplifying":
      return "Simplifying mesh…";
    case "textures":
      return "Compressing textures…";
    case "draco":
      return "Compressing geometry…";
    case "writing":
      return "Writing optimized file…";
    case "done":
      return "Compression complete";
  }
}

async function prepareGlbForUpload(
  file: File,
  onProgress?: (progress: ProductModelUploadProgress) => void,
  signal?: AbortSignal,
): Promise<{
  file: File;
  originalBytes: number;
  optimizedBytes: number;
  savedPercent: number;
}> {
  throwIfAborted(signal);
  onProgress?.({
    percent: 1,
    phase: "compressing",
    label: "Starting compression…",
    originalBytes: file.size,
  });

  const { optimizeGlbFile } = await import("./optimize-glb-client");
  throwIfAborted(signal);

  const result = await optimizeGlbFile(file, (optimizeProgress) => {
    // Reserve 0–55% of total progress for in-browser optimization.
    onProgress?.({
      percent: Math.max(1, Math.round(optimizeProgress.percent * 0.55)),
      phase: "compressing",
      label: optimizeProgress.label || mapOptimizePhase(optimizeProgress.phase),
      originalBytes: file.size,
      optimizedBytes: undefined,
    });
  });

  throwIfAborted(signal);

  onProgress?.({
    percent: 55,
    phase: "compressing",
    label: `Compressed ${formatBytes(result.originalBytes)} → ${formatBytes(result.optimizedBytes)} (−${result.savedPercent}%)`,
    originalBytes: result.originalBytes,
    optimizedBytes: result.optimizedBytes,
    savedPercent: result.savedPercent,
  });

  return {
    file: result.file,
    originalBytes: result.originalBytes,
    optimizedBytes: result.optimizedBytes,
    savedPercent: result.savedPercent,
  };
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
  let originalBytes: number | undefined;
  let optimizedBytes: number | undefined;
  let savedPercent: number | undefined;

  if (getProductModelExtension(file.name) === ".glb") {
    const prepared = await prepareGlbForUpload(file, onProgress, signal);
    uploadFile = prepared.file;
    alreadyOptimized = true;
    originalBytes = prepared.originalBytes;
    optimizedBytes = prepared.optimizedBytes;
    savedPercent = prepared.savedPercent;
  }

  throwIfAborted(signal);
  onProgress?.({
    percent: alreadyOptimized ? 56 : 0,
    phase: "uploading",
    label: alreadyOptimized
      ? `Uploading optimized model (${formatBytes(uploadFile.size)})… Please wait — do not close this window.`
      : "Uploading model… Please wait — do not close this window.",
    originalBytes,
    optimizedBytes,
    savedPercent,
  });

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
        const base = alreadyOptimized ? 56 : 5;
        const span = alreadyOptimized ? 39 : 90;
        onProgress?.({
          percent: base + Math.round(percent * (span / 100)),
          phase: "uploading",
          label: alreadyOptimized
            ? `Uploading optimized model (${formatBytes(uploadFile.size)})… Please wait — do not close this window.`
            : "Uploading model… Please wait — do not close this window.",
          originalBytes,
          optimizedBytes,
          savedPercent,
        });
      },
    });
  } catch (error) {
    if (isUploadAbortError(error)) throw error;
    throw error;
  }

  throwIfAborted(signal);
  onProgress?.({
    percent: alreadyOptimized ? 96 : 95,
    phase: "saving",
    label: "Saving model to product…",
    originalBytes,
    optimizedBytes,
    savedPercent,
  });

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

  onProgress?.({
    percent: 100,
    phase: "done",
    label:
      originalBytes != null && optimizedBytes != null
        ? `Done — ${formatBytes(originalBytes)} → ${formatBytes(optimizedBytes)} (−${savedPercent ?? 0}%)`
        : "Done",
    originalBytes,
    optimizedBytes,
    savedPercent,
  });

  return {
    ...registered.model,
    originalBytes,
    optimizedBytes,
    savedPercent,
  };
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
