"use client";

import { useEffect, useRef, useState } from "react";
import {
  checkProductModelFile,
  formatProductModelFormatsLabel,
  PRODUCT_MODEL_ACCEPT,
  PRODUCT_MODEL_MAX_BYTES,
  PRODUCT_MODEL_UPLOAD_MAX_BYTES,
  rejectReasonLabel,
} from "@/lib/admin/products/model-formats";
import {
  deleteProductModel,
  isUploadAbortError,
  registerProductModelUrl,
  uploadProductModel,
  type ProductModelUploadResult,
} from "@/lib/admin/products/upload-product-model";
import { adminFieldClassName, adminLabelClassName } from "./admin-form-styles";
import { AdminConfirmDialog } from "./admin-confirm-dialog";
import { AdminProductModelPreview } from "./admin-product-model-preview";

export type ProductModelChangePayload = {
  publicUrl: string;
  fileName: string;
} | null;

type AdminProductModelUploadProps = {
  productId: string | null;
  productSlug: string;
  modelUrl: string | null;
  modelFileName: string | null;
  disabled?: boolean;
  onModelChange: (model: ProductModelChangePayload) => void;
  onUploadingChange?: (uploading: boolean) => void;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AdminProductModelUpload({
  productId,
  productSlug,
  modelUrl,
  modelFileName,
  disabled = false,
  onModelChange,
  onUploadingChange,
}: AdminProductModelUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadAbortRef = useRef<AbortController | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savingUrl, setSavingUrl] = useState(false);
  const [urlInput, setUrlInput] = useState(modelUrl ?? "");
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const dragDepthRef = useRef(0);

  const canUpload = Boolean(productId) && !disabled;

  useEffect(() => {
    return () => {
      uploadAbortRef.current?.abort();
      uploadAbortRef.current = null;
    };
  }, []);

  useEffect(() => {
    onUploadingChange?.(uploading || savingUrl);
  }, [uploading, savingUrl, onUploadingChange]);

  useEffect(() => {
    setUrlInput(modelUrl ?? "");
  }, [modelUrl]);

  const busy = uploading || deleting || savingUrl;

  const uploadFile = async (file: File) => {
    if (!productId || !canUpload || busy) return;

    const rejection = checkProductModelFile(file);
    if (rejection) {
      setError(rejectReasonLabel(rejection));
      return;
    }

    uploadAbortRef.current?.abort();
    const controller = new AbortController();
    uploadAbortRef.current = controller;

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const result: ProductModelUploadResult = await uploadProductModel({
        productId,
        file,
        signal: controller.signal,
        onProgress: setProgress,
      });
      onModelChange({
        publicUrl: result.publicUrl,
        fileName: result.fileName,
      });
    } catch (uploadError) {
      if (isUploadAbortError(uploadError)) return;
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      if (uploadAbortRef.current === controller) {
        uploadAbortRef.current = null;
      }
      setUploading(false);
      setProgress(0);
    }
  };

  const handlePickFile = () => {
    if (!canUpload || busy) return;
    inputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // Copy before clearing — FileList is live and empties when value is reset.
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    const file = files[0];
    if (!file) return;
    await uploadFile(file);
  };

  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!canUpload || busy) return;
    dragDepthRef.current += 1;
    setDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) {
      setDragging(false);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!canUpload || busy) return;
    event.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepthRef.current = 0;
    setDragging(false);

    if (!canUpload || busy) return;

    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const handleDelete = async () => {
    if (!productId || !modelUrl) return;

    setDeleting(true);
    setError(null);

    try {
      await deleteProductModel(productId);
      onModelChange(null);
      setUrlInput("");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const handleApplyUrl = async () => {
    if (!productId || !canUpload || busy) return;

    const trimmedUrl = urlInput.trim();
    if (!trimmedUrl) {
      setError("Enter a model URL.");
      return;
    }

    setSavingUrl(true);
    setError(null);

    try {
      const result = await registerProductModelUrl(productId, trimmedUrl);
      onModelChange({
        publicUrl: result.publicUrl,
        fileName: result.fileName,
      });
    } catch (urlError) {
      setError(urlError instanceof Error ? urlError.message : "Could not save model URL");
    } finally {
      setSavingUrl(false);
    }
  };

  const dropZoneClassName = `flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 transition-colors ${
    !canUpload || busy
      ? "cursor-not-allowed border-outline-variant bg-surface-container opacity-60"
      : dragging
        ? "border-primary bg-primary/10"
        : "border-outline-variant bg-surface-container hover:border-primary hover:bg-surface-container-high"
  }`;

  return (
    <div>
      <label className={adminLabelClassName}>3D Model</label>
      <p className="mb-3 text-xs text-on-surface-variant">
        {formatProductModelFormatsLabel()} · GLB up to {formatFileSize(PRODUCT_MODEL_UPLOAD_MAX_BYTES)}{" "}
        (optimized in your browser before upload) · other formats max{" "}
        {formatFileSize(PRODUCT_MODEL_MAX_BYTES)}
      </p>

      {!productId && (
        <p className="mb-3 rounded-lg border border-outline-variant bg-surface-container-high px-4 py-3 text-sm text-on-surface-variant">
          Save the product first, then upload a 3D model or paste a URL.
        </p>
      )}

      {modelUrl ? (
        <div className="space-y-3">
          <AdminProductModelPreview
            src={modelUrl}
            alt={modelFileName ?? `${productSlug} 3D model`}
          />

          <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-secondary-container">
                <span className="material-symbols-outlined text-on-secondary-container">
                  view_in_ar
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-primary">
                  {modelFileName ?? "3D model"}
                </p>
                <p className="mt-0.5 truncate font-mono text-xs text-on-surface-variant">
                  {productSlug}
                </p>
                <a
                  href={modelUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-xs font-semibold uppercase tracking-[0.08em] text-primary underline-offset-2 hover:underline"
                >
                  Preview file
                </a>
              </div>
              {canUpload && (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteOpen(true)}
                  disabled={busy}
                  className="material-symbols-outlined rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-error disabled:opacity-50"
                  aria-label="Remove 3D model"
                >
                  {deleting ? "hourglass_empty" : "delete"}
                </button>
              )}
            </div>
          </div>

          {canUpload && (
            <div
              role="button"
              tabIndex={0}
              onClick={handlePickFile}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handlePickFile();
                }
              }}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={(event) => void handleDrop(event)}
              className={dropZoneClassName}
            >
              <span className="material-symbols-outlined text-2xl text-on-surface-variant">
                {uploading ? "hourglass_top" : dragging ? "file_download" : "swap_horiz"}
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">
                {uploading ? "Uploading…" : dragging ? "Drop to replace" : "Replace 3D model"}
              </span>
              <span className="text-xs text-on-surface-variant">
                Drag & drop or click · {formatProductModelFormatsLabel()}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div
          role="button"
          tabIndex={canUpload ? 0 : -1}
          onClick={handlePickFile}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handlePickFile();
            }
          }}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={(event) => void handleDrop(event)}
          className={dropZoneClassName}
        >
          <span className="material-symbols-outlined text-3xl text-on-surface-variant">
            {uploading ? "hourglass_top" : dragging ? "file_download" : "upload_file"}
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">
            {uploading ? "Uploading…" : dragging ? "Drop file here" : "Upload 3D model"}
          </span>
          <span className="text-xs text-on-surface-variant">
            Drag & drop or click · {formatProductModelFormatsLabel()}
          </span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={PRODUCT_MODEL_ACCEPT}
        className="sr-only"
        disabled={!canUpload || busy}
        onChange={(event) => void handleFileChange(event)}
      />

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-outline-variant/30" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
          or paste URL
        </span>
        <div className="h-px flex-1 bg-outline-variant/30" />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <input
          type="url"
          value={urlInput}
          onChange={(event) => setUrlInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void handleApplyUrl();
            }
          }}
          placeholder="https://example.com/model.glb"
          disabled={!canUpload || busy}
          className={`${adminFieldClassName} font-mono text-xs sm:flex-1`}
        />
        <button
          type="button"
          onClick={() => void handleApplyUrl()}
          disabled={!canUpload || busy || !urlInput.trim()}
          className="shrink-0 rounded-lg border border-outline-variant px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-primary transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50"
        >
          {savingUrl ? "Saving…" : modelUrl ? "Update URL" : "Use URL"}
        </button>
      </div>
      <p className="mt-2 text-xs text-on-surface-variant">
        Direct link to a hosted {formatProductModelFormatsLabel()} file.
      </p>

      {uploading && (
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-xs text-on-surface-variant">
            <span>Uploading and optimizing…</span>
            <span>{progress}%</span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-surface-container-high"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-lg border border-outline-variant bg-surface-container-high px-4 py-3 text-sm text-primary">
          {error}
        </p>
      )}

      <AdminConfirmDialog
        open={confirmDeleteOpen}
        title="Delete 3D model?"
        description="This will remove the current model from this product."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        tone="danger"
        busy={deleting}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={() => {
          setConfirmDeleteOpen(false);
          void handleDelete();
        }}
      />
    </div>
  );
}
