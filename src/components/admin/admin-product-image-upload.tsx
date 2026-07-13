"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  /** Called with the latest image list after upload / delete / set-primary so parent state stays in sync. */
  onImagesChange: (images: ProductImageItem[]) => void;
  onUploadingChange?: (uploading: boolean) => void;
};

type PendingUpload = {
  id: string;
  file: File;
  previewUrl: string;
  status: "queued" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function createPendingId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function ImageTile({
  image,
  canMutate,
  deleting,
  settingPrimary,
  onDelete,
  onSetPrimary,
}: {
  image: ProductImageItem;
  canMutate: boolean;
  deleting: boolean;
  settingPrimary: boolean;
  onDelete: (image: ProductImageItem) => void;
  onSetPrimary: (image: ProductImageItem) => void;
}) {
  const busy = deleting || settingPrimary;

  return (
    <div className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-surface-container">
      <img src={image.publicUrl} alt="" className="size-full object-cover" loading="lazy" />
      {image.isPrimary && (
        <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-on-primary">
          Primary
        </span>
      )}
      {canMutate && (
        <button
          type="button"
          disabled={busy}
          onClick={() => onDelete(image)}
          className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-surface/95 text-error shadow-sm transition-colors hover:bg-surface disabled:opacity-50"
          aria-label={`Delete ${image.fileName}`}
        >
          <span className="material-symbols-outlined text-[16px]">delete</span>
        </button>
      )}
      {canMutate && !image.isPrimary && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            type="button"
            disabled={busy}
            onClick={() => onSetPrimary(image)}
            className="w-full rounded bg-white/90 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.06em] text-primary disabled:opacity-50"
          >
            Set primary
          </button>
        </div>
      )}
      {busy && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface/70">
          <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
        </div>
      )}
    </div>
  );
}

function PendingImageTile({
  pending,
  canRemove,
  onRemove,
}: {
  pending: PendingUpload;
  canRemove: boolean;
  onRemove: (id: string) => void;
}) {
  const statusLabel =
    pending.status === "queued"
      ? "Queued"
      : pending.status === "uploading"
        ? `Uploading ${pending.progress}%`
        : pending.status === "done"
          ? "Uploaded"
        : "Upload failed";

  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-outline-variant bg-surface-container">
      <img
        src={pending.previewUrl}
        alt={pending.file.name}
        className={`size-full object-cover ${pending.status === "error" ? "opacity-60" : ""}`}
      />

      <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-on-primary">
        New
      </span>

      {canRemove && (
        <button
          type="button"
          onClick={() => onRemove(pending.id)}
          className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-surface/95 text-error shadow-sm transition-colors hover:bg-surface"
          aria-label={`Remove ${pending.file.name}`}
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      )}

      <div className="absolute inset-x-0 bottom-0 space-y-1 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-2 pt-8">
        <p className="truncate text-[10px] font-medium text-white" title={pending.file.name}>
          {pending.file.name}
        </p>
        <p className="text-[9px] font-semibold uppercase tracking-[0.06em] text-white/90">
          {statusLabel}
        </p>
        {(pending.status === "uploading" || pending.status === "done") && (
          <div
            className="h-1 overflow-hidden rounded-full bg-white/30"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pending.progress}
          >
            <div
              className="h-full rounded-full bg-white transition-[width] duration-200"
              style={{ width: `${pending.progress}%` }}
            />
          </div>
        )}
        {pending.status === "error" && pending.error && (
          <p className="text-[9px] leading-snug text-red-200">{pending.error}</p>
        )}
      </div>
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
  const dragDepthRef = useRef(0);
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  const pendingRef = useRef<PendingUpload[]>([]);

  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [localImages, setLocalImages] = useState<ProductImageItem[]>(images);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteImage, setConfirmDeleteImage] = useState<ProductImageItem | null>(null);

  const canUpload = Boolean(productId) && !disabled;
  const uploading = pendingUploads.some((item) => item.status === "uploading");
  const busy = uploading || Boolean(deletingId) || Boolean(settingPrimaryId);
  const activeUpload = pendingUploads.find((item) => item.status === "uploading") ?? null;
  const queuedCount = pendingUploads.filter((item) => item.status === "queued").length;

  pendingRef.current = pendingUploads;

  const updatePending = useCallback((id: string, patch: Partial<PendingUpload>) => {
    setPendingUploads((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }, []);

  const removePending = useCallback((id: string) => {
    abortControllersRef.current.get(id)?.abort();
    abortControllersRef.current.delete(id);

    setPendingUploads((current) => {
      const target = current.find((item) => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return current.filter((item) => item.id !== id);
    });
  }, []);

  useEffect(() => {
    return () => {
      abortControllersRef.current.forEach((controller) => controller.abort());
      abortControllersRef.current.clear();
      pendingRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  useEffect(() => {
    onUploadingChange?.(uploading);
  }, [uploading, onUploadingChange]);

  const hasActivePending = pendingUploads.some(
    (item) => item.status === "queued" || item.status === "uploading" || item.status === "done",
  );

  // Sync from parent when idle. Skip while uploads/deletes are in flight so a
  // stale prop (before parent setState / router.refresh) cannot wipe local UI.
  useEffect(() => {
    if (busy || hasActivePending) return;
    setLocalImages(images);
  }, [images, busy, hasActivePending]);

  const commitImages = useCallback(
    (next: ProductImageItem[]) => {
      setLocalImages(next);
      onImagesChange(next);
    },
    [onImagesChange],
  );

  const enqueueFiles = useCallback(
    (files: File[]) => {
      if (!productId || !canUpload) {
        setError("Save the product first, then add images.");
        return;
      }

      const validFiles = files.filter(isAllowedProductImageFile);
      if (!validFiles.length) {
        setError(`Use ${formatProductImageFormatsLabel()} up to ${formatFileSize(PRODUCT_IMAGE_MAX_BYTES)} each.`);
        return;
      }

      if (validFiles.length !== files.length) {
        setError(`Some files were skipped. Use ${formatProductImageFormatsLabel()} only.`);
      } else {
        setError(null);
      }

      const nextPending = validFiles.map((file) => ({
        id: createPendingId(),
        file,
        previewUrl: URL.createObjectURL(file),
        status: "queued" as const,
        progress: 0,
      }));

      // Keep ref in sync immediately so the upload effect can start on this tick.
      pendingRef.current = [...pendingRef.current, ...nextPending];
      setPendingUploads(pendingRef.current);
    },
    [canUpload, productId],
  );

  const uploadPending = useCallback(
    async (pendingId: string) => {
      if (!productId) return;

      const pending = pendingRef.current.find((item) => item.id === pendingId);
      if (!pending || pending.status !== "queued") return;

      const controller = new AbortController();
      abortControllersRef.current.set(pendingId, controller);
      updatePending(pendingId, { status: "uploading", progress: 0, error: undefined });

      try {
        // Show activity while the signed URL is being created (can take several seconds).
        updatePending(pendingId, { progress: 8 });

        const uploaded = await uploadProductImage({
          productId,
          file: pending.file,
          signal: controller.signal,
          onProgress: (percent) =>
            updatePending(pendingId, { progress: Math.max(8, percent) }),
        });

        let nextImages: ProductImageItem[] = [];
        setLocalImages((current) => {
          const withoutDupes = current.filter((item) => item.id !== uploaded.id);
          nextImages = [...withoutDupes, uploaded].sort((a, b) => a.sortOrder - b.sortOrder);
          return nextImages;
        });
        onImagesChange(nextImages);

        updatePending(pendingId, { status: "done", progress: 100 });
        window.setTimeout(() => removePending(pendingId), 900);
      } catch (uploadError) {
        if (isUploadAbortError(uploadError)) {
          removePending(pendingId);
          return;
        }
        updatePending(pendingId, {
          status: "error",
          error: uploadError instanceof Error ? uploadError.message : "Upload failed",
        });
      } finally {
        abortControllersRef.current.delete(pendingId);
      }
    },
    [onImagesChange, productId, removePending, updatePending],
  );

  useEffect(() => {
    if (!productId || uploading) return;
    const next = pendingUploads.find((item) => item.status === "queued");
    if (!next) return;
    void uploadPending(next.id);
  }, [pendingUploads, productId, uploadPending, uploading]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Copy before clearing — FileList is live and empties when value is reset.
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;
    enqueueFiles(files);
  };

  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!canUpload) return;
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
    if (!canUpload) return;
    event.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepthRef.current = 0;
    setDragging(false);

    if (!canUpload) return;
    enqueueFiles(Array.from(event.dataTransfer.files));
  };

  const handleDelete = async (image: ProductImageItem) => {
    if (!productId) return;

    const previous = localImages;
    const next = localImages.filter((item) => item.id !== image.id);

    setDeletingId(image.id);
    setError(null);
    // Optimistic local remove so the tile disappears immediately.
    setLocalImages(next);

    try {
      await deleteProductImage(productId, image.id);
      onImagesChange(next);
    } catch (deleteError) {
      setLocalImages(previous);
      setError(deleteError instanceof Error ? deleteError.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetPrimary = async (image: ProductImageItem) => {
    if (!productId) return;

    const previous = localImages;
    const optimistic = previous.map((item) =>
      item.id === image.id ? { ...item, isPrimary: true } : { ...item, isPrimary: false },
    );

    setSettingPrimaryId(image.id);
    setError(null);
    setLocalImages(optimistic);

    try {
      const updated = await setPrimaryProductImage(productId, image.id);
      const next = previous.map((item) =>
        item.id === updated.id
          ? { ...item, ...updated, isPrimary: true }
          : { ...item, isPrimary: false },
      );
      commitImages(next);
    } catch (primaryError) {
      setLocalImages(previous);
      setError(primaryError instanceof Error ? primaryError.message : "Could not set primary image");
    } finally {
      setSettingPrimaryId(null);
    }
  };

  const addTileClassName = `flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-3 py-4 text-center transition-colors ${
    !canUpload
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
        onDrop={handleDrop}
        className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4"
      >
        {localImages.map((image) => (
          <ImageTile
            key={image.id}
            image={image}
            canMutate={canUpload}
            deleting={deletingId === image.id}
            settingPrimary={settingPrimaryId === image.id}
            onDelete={(item) => setConfirmDeleteImage(item)}
            onSetPrimary={(item) => void handleSetPrimary(item)}
          />
        ))}

        {pendingUploads.map((pending) => (
          <PendingImageTile
            key={pending.id}
            pending={pending}
            canRemove={canUpload}
            onRemove={removePending}
          />
        ))}

        <label
          htmlFor={canUpload ? "product-image-file-input" : undefined}
          aria-disabled={!canUpload}
          className={addTileClassName}
        >
          <span className="material-symbols-outlined text-2xl text-on-surface-variant">
            {uploading ? "hourglass_top" : dragging ? "file_download" : "add_a_photo"}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-primary">
            {uploading ? "Uploading…" : dragging ? "Drop here" : "Add image"}
          </span>
        </label>
      </div>

      <input
        id="product-image-file-input"
        ref={inputRef}
        type="file"
        accept={PRODUCT_IMAGE_ACCEPT}
        multiple
        className="sr-only"
        disabled={!canUpload}
        onChange={handleFileChange}
      />

      {(activeUpload || queuedCount > 0) && (
        <div className="mt-4 rounded-lg border border-outline-variant bg-surface-container-high px-4 py-3">
          <div className="mb-1 flex items-center justify-between text-xs text-on-surface-variant">
            <span className="truncate">
              {activeUpload
                ? `Uploading ${activeUpload.file.name}`
                : queuedCount > 0
                  ? `Preparing ${queuedCount} image${queuedCount > 1 ? "s" : ""}...`
                  : "Preparing upload..."}
            </span>
            <span>{activeUpload ? `${activeUpload.progress}%` : "0%"}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-200"
              style={{ width: `${activeUpload ? activeUpload.progress : 8}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-lg border border-outline-variant bg-surface-container-high px-4 py-3 text-sm text-primary">
          {error}
        </p>
      )}

      {confirmDeleteImage && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm image delete"
        >
          <div className="w-full max-w-md rounded-xl border border-outline-variant bg-surface p-5 shadow-xl">
            <h3 className="text-base font-semibold text-primary">Delete image?</h3>
            <p className="mt-2 text-sm text-on-surface-variant">
              Remove <span className="font-medium text-primary">{confirmDeleteImage.fileName}</span> from this
              product.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteImage(null)}
                className="rounded-lg border border-outline-variant px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-on-surface-variant transition-colors hover:bg-surface-container"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = confirmDeleteImage;
                  setConfirmDeleteImage(null);
                  if (target) void handleDelete(target);
                }}
                className="rounded-lg bg-error px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-on-error transition-opacity hover:opacity-90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
