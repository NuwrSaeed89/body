"use client";

import { useEffect, useRef, useState } from "react";
import {
  formatProductImageFormatsLabel,
  isAllowedProductImageFile,
  PRODUCT_IMAGE_ACCEPT,
  PRODUCT_IMAGE_MAX_BYTES,
} from "@/lib/admin/products/image-formats";
import {
  deleteProductImage,
  isUploadAbortError,
  setPrimaryProductImage,
  uploadProductImage,
  type ProductImageItem,
} from "@/lib/admin/products/upload-product-image";
import { adminLabelClassName } from "./admin-form-styles";

type AdminProductImageUploadProps = {
  productId: string | null;
  images: ProductImageItem[];
  disabled?: boolean;
  onImagesChange: () => void;
  onUploadingChange?: (uploading: boolean) => void;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ImageTile({
  image,
  canMutate,
  busy,
  onDelete,
  onSetPrimary,
}: {
  image: ProductImageItem;
  canMutate: boolean;
  busy: boolean;
  onDelete: (image: ProductImageItem) => void;
  onSetPrimary: (image: ProductImageItem) => void;
}) {
  return (
    <div className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-surface-container">
      <img src={image.publicUrl} alt="" className="size-full object-cover" loading="lazy" />
      {image.isPrimary && (
        <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-on-primary">
          Primary
        </span>
      )}
      {canMutate && (
        <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          {!image.isPrimary && (
            <button
              type="button"
              disabled={busy}
              onClick={() => onSetPrimary(image)}
              className="flex-1 rounded bg-white/90 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.06em] text-primary disabled:opacity-50"
            >
              Set primary
            </button>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() => onDelete(image)}
            className="rounded bg-white/90 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.06em] text-error disabled:opacity-50"
            aria-label="Delete image"
          >
            <span className="material-symbols-outlined text-[14px]">delete</span>
          </button>
        </div>
      )}
    </div>
  );
}

export function AdminProductImageUpload({
  productId,
  images,
  disabled = false,
  onImagesChange,
  onUploadingChange,
}: AdminProductImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadAbortRef = useRef<AbortController | null>(null);
  const dragDepthRef = useRef(0);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const canUpload = Boolean(productId) && !disabled;
  const busy = uploading || Boolean(deletingId) || Boolean(settingPrimaryId);

  useEffect(() => {
    return () => {
      uploadAbortRef.current?.abort();
      uploadAbortRef.current = null;
    };
  }, []);

  useEffect(() => {
    onUploadingChange?.(uploading);
  }, [uploading, onUploadingChange]);

  const uploadFile = async (file: File) => {
    if (!productId || !canUpload || busy) return;

    if (!isAllowedProductImageFile(file)) {
      setError(
        `Invalid file. Use ${formatProductImageFormatsLabel()} up to ${formatFileSize(PRODUCT_IMAGE_MAX_BYTES)}.`,
      );
      return;
    }

    uploadAbortRef.current?.abort();
    const controller = new AbortController();
    uploadAbortRef.current = controller;

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      await uploadProductImage({
        productId,
        file,
        signal: controller.signal,
        onProgress: setProgress,
      });
      onImagesChange();
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
    const files = event.target.files;
    event.target.value = "";
    if (!files?.length) return;

    for (const file of Array.from(files)) {
      await uploadFile(file);
    }
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

    const files = Array.from(event.dataTransfer.files).filter((file) =>
      isAllowedProductImageFile(file),
    );
    if (!files.length) {
      setError(`Drop ${formatProductImageFormatsLabel()} files only.`);
      return;
    }

    for (const file of files) {
      await uploadFile(file);
    }
  };

  const handleDelete = async (image: ProductImageItem) => {
    if (!productId) return;
    if (!window.confirm("Remove this image from the product?")) return;

    setDeletingId(image.id);
    setError(null);

    try {
      await deleteProductImage(productId, image.id);
      onImagesChange();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetPrimary = async (image: ProductImageItem) => {
    if (!productId) return;

    setSettingPrimaryId(image.id);
    setError(null);

    try {
      await setPrimaryProductImage(productId, image.id);
      onImagesChange();
    } catch (primaryError) {
      setError(primaryError instanceof Error ? primaryError.message : "Could not set primary image");
    } finally {
      setSettingPrimaryId(null);
    }
  };

  const addTileClassName = `flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-3 py-4 text-center transition-colors ${
    !canUpload || busy
      ? "cursor-not-allowed border-outline-variant bg-surface-container opacity-60"
      : dragging
        ? "cursor-copy border-primary bg-primary/10"
        : "cursor-pointer border-outline-variant bg-surface-container hover:border-primary hover:bg-surface-container-high"
  }`;

  return (
    <div>
      <label className={adminLabelClassName}>Product Images</label>
      <p className="mb-3 text-xs text-on-surface-variant">
        {formatProductImageFormatsLabel()} · max {formatFileSize(PRODUCT_IMAGE_MAX_BYTES)} each
      </p>

      {!productId && (
        <p className="mb-3 rounded-lg border border-outline-variant bg-surface-container-high px-4 py-3 text-sm text-on-surface-variant">
          Save the product first, then add images.
        </p>
      )}

      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={(event) => void handleDrop(event)}
        className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4"
      >
        {images.map((image) => (
          <ImageTile
            key={image.id}
            image={image}
            canMutate={canUpload}
            busy={busy}
            onDelete={(item) => void handleDelete(item)}
            onSetPrimary={(item) => void handleSetPrimary(item)}
          />
        ))}

        <div
          role="button"
          tabIndex={canUpload && !busy ? 0 : -1}
          onClick={handlePickFile}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handlePickFile();
            }
          }}
          className={addTileClassName}
        >
          <span className="material-symbols-outlined text-2xl text-on-surface-variant">
            {uploading ? "hourglass_top" : dragging ? "file_download" : "add_a_photo"}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-primary">
            {uploading ? "Uploading…" : dragging ? "Drop here" : "Add image"}
          </span>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={PRODUCT_IMAGE_ACCEPT}
        multiple
        className="sr-only"
        disabled={!canUpload || busy}
        onChange={(event) => void handleFileChange(event)}
      />

      {uploading && (
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-xs text-on-surface-variant">
            <span>Uploading image…</span>
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
    </div>
  );
}
