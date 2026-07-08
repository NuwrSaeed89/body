import "server-only";

import { publicEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  buildProductImagePublicUrl,
  buildProductImageStoragePath,
  getProductImageMimeType,
  isManagedProductImageStoragePath,
  PRODUCT_IMAGE_BUCKET,
  PRODUCT_IMAGE_MAX_BYTES,
} from "./image-formats";

export type ProductImageMedia = {
  id: string;
  productId: string;
  storagePath: string;
  publicUrl: string;
  fileName: string;
  isPrimary: boolean;
  sortOrder: number;
};

type DbImageMediaRow = {
  id: string;
  product_id: string;
  storage_path: string;
  public_url: string;
  is_primary: boolean;
  sort_order: number;
};

function fileNameFromPath(storagePath: string): string {
  const segment = storagePath.split("/").pop() ?? storagePath;
  return decodeURIComponent(segment);
}

async function removeStorageObject(storagePath: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove([storagePath]);
  if (error) throw error;
}

export async function listProductImages(productId: string): Promise<ProductImageMedia[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("product_media")
    .select("id, product_id, storage_path, public_url, is_primary, sort_order")
    .eq("product_id", productId)
    .eq("kind", "image")
    .order("is_primary", { ascending: false })
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const item = row as DbImageMediaRow;
    return {
      id: item.id,
      productId: item.product_id,
      storagePath: item.storage_path,
      publicUrl: item.public_url,
      fileName: fileNameFromPath(item.storage_path),
      isPrimary: item.is_primary,
      sortOrder: item.sort_order,
    };
  });
}

export type ImageUploadSession = {
  storagePath: string;
  publicUrl: string;
  signedUrl: string;
  token: string;
  contentType: string;
};

export async function createProductImageUploadSession(
  productId: string,
  fileName: string,
  fileSize: number,
): Promise<ImageUploadSession> {
  if (fileSize <= 0 || fileSize > PRODUCT_IMAGE_MAX_BYTES) {
    throw new Error("File exceeds the 10 MB upload limit");
  }

  const supabase = createSupabaseAdminClient();
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("slug")
    .eq("id", productId)
    .maybeSingle();

  if (productError) throw productError;
  if (!product?.slug) throw new Error("Product not found");

  const storagePath = buildProductImageStoragePath(product.slug, fileName);
  const { data, error } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .createSignedUploadUrl(storagePath);

  if (error) throw error;
  if (!data?.signedUrl || !data.token) {
    throw new Error("Could not create upload session");
  }

  if (!publicEnv.supabaseUrl) {
    throw new Error("Supabase URL is not configured");
  }

  return {
    storagePath,
    publicUrl: buildProductImagePublicUrl(publicEnv.supabaseUrl, storagePath),
    signedUrl: data.signedUrl,
    token: data.token,
    contentType: getProductImageMimeType(fileName),
  };
}

export async function registerProductImageMedia(
  productId: string,
  storagePath: string,
  publicUrl: string,
  altText?: string | null,
): Promise<ProductImageMedia> {
  const supabase = createSupabaseAdminClient();

  const { data: existingRows, error: listError } = await supabase
    .from("product_media")
    .select("id, sort_order, is_primary")
    .eq("product_id", productId)
    .eq("kind", "image");

  if (listError) throw listError;

  const hasPrimary = (existingRows ?? []).some(
    (row) => (row as { is_primary: boolean }).is_primary,
  );
  const nextSortOrder =
    (existingRows ?? []).reduce(
      (max, row) => Math.max(max, Number((row as { sort_order: number }).sort_order ?? 0)),
      -1,
    ) + 1;

  const { data, error: insertError } = await supabase
    .from("product_media")
    .insert({
      product_id: productId,
      kind: "image",
      storage_bucket: PRODUCT_IMAGE_BUCKET,
      storage_path: storagePath,
      public_url: publicUrl,
      alt_text: altText ?? null,
      sort_order: nextSortOrder,
      is_primary: !hasPrimary,
    })
    .select("id, product_id, storage_path, public_url, is_primary, sort_order")
    .single();

  if (insertError) throw insertError;

  const row = data as DbImageMediaRow;
  return {
    id: row.id,
    productId: row.product_id,
    storagePath: row.storage_path,
    publicUrl: row.public_url,
    fileName: fileNameFromPath(row.storage_path),
    isPrimary: row.is_primary,
    sortOrder: row.sort_order,
  };
}

export async function deleteProductImageMedia(mediaId: string): Promise<void> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("product_media")
    .select("id, product_id, storage_path, is_primary")
    .eq("id", mediaId)
    .eq("kind", "image")
    .maybeSingle();

  if (error) throw error;
  if (!data) return;

  const row = data as { id: string; product_id: string; storage_path: string; is_primary: boolean };

  const { error: deleteError } = await supabase.from("product_media").delete().eq("id", mediaId);
  if (deleteError) throw deleteError;

  if (isManagedProductImageStoragePath(row.storage_path)) {
    try {
      await removeStorageObject(row.storage_path);
    } catch (storageError) {
      console.warn("[admin] could not delete image storage object:", storageError);
    }
  }

  if (row.is_primary) {
    const { data: nextImage, error: nextError } = await supabase
      .from("product_media")
      .select("id")
      .eq("product_id", row.product_id)
      .eq("kind", "image")
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (nextError) throw nextError;
    if (nextImage?.id) {
      await supabase
        .from("product_media")
        .update({ is_primary: true })
        .eq("id", (nextImage as { id: string }).id);
    }
  }
}

export async function setPrimaryProductImage(mediaId: string): Promise<ProductImageMedia> {
  const supabase = createSupabaseAdminClient();

  const { data: image, error: imageError } = await supabase
    .from("product_media")
    .select("id, product_id, storage_path, public_url, is_primary, sort_order")
    .eq("id", mediaId)
    .eq("kind", "image")
    .maybeSingle();

  if (imageError) throw imageError;
  if (!image) throw new Error("Image not found");

  const row = image as DbImageMediaRow;

  const { error: clearError } = await supabase
    .from("product_media")
    .update({ is_primary: false })
    .eq("product_id", row.product_id)
    .eq("kind", "image");

  if (clearError) throw clearError;

  const { data: updated, error: updateError } = await supabase
    .from("product_media")
    .update({ is_primary: true })
    .eq("id", mediaId)
    .select("id, product_id, storage_path, public_url, is_primary, sort_order")
    .single();

  if (updateError) throw updateError;

  const updatedRow = updated as DbImageMediaRow;
  return {
    id: updatedRow.id,
    productId: updatedRow.product_id,
    storagePath: updatedRow.storage_path,
    publicUrl: updatedRow.public_url,
    fileName: fileNameFromPath(updatedRow.storage_path),
    isPrimary: updatedRow.is_primary,
    sortOrder: updatedRow.sort_order,
  };
}

export function mapProductImageError(error: unknown): string {
  if (!error || typeof error !== "object") return "Unknown error";
  const record = error as { message?: string };
  return record.message ?? "Image operation failed";
}
