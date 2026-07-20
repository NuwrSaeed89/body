import "server-only";

import { publicEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  buildExternalProductModelStoragePath,
  buildProductModelPublicUrl,
  buildProductModelStoragePath,
  fileNameFromModelUrl,
  getProductModelMimeType,
  getProductModelUploadMaxBytes,
  isAllowedProductModelUrl,
  isExternalProductModelStoragePath,
  PRODUCT_MODEL_BUCKET,
  PRODUCT_MODEL_MAX_BYTES,
} from "./model-formats";
import { optimizeGlbBytes } from "./optimize-glb";

export type ProductModelMedia = {
  id: string;
  productId: string;
  storagePath: string;
  publicUrl: string;
  fileName: string;
};

type DbModelMediaRow = {
  id: string;
  product_id: string;
  storage_path: string;
  public_url: string;
};

function fileNameFromPath(storagePath: string): string {
  const segment = storagePath.split("/").pop() ?? storagePath;
  return decodeURIComponent(segment);
}

function isGlbPath(storagePath: string): boolean {
  return storagePath.toLowerCase().endsWith(".glb");
}

async function optimizeGlbInStorage(storagePath: string): Promise<void> {
  if (!isGlbPath(storagePath)) return;

  const supabase = createSupabaseAdminClient();
  const { data: fileData, error: downloadError } = await supabase.storage
    .from(PRODUCT_MODEL_BUCKET)
    .download(storagePath);
  if (downloadError || !fileData) {
    throw downloadError ?? new Error("Could not download uploaded model for optimization");
  }

  const sourceBytes = Buffer.from(await fileData.arrayBuffer());
  const { buffer, originalBytes, optimizedBytes, didOptimize } =
    await optimizeGlbBytes(sourceBytes);

  if (buffer.length > PRODUCT_MODEL_MAX_BYTES) {
    throw new Error(
      `After optimization the model is still ${(buffer.length / (1024 * 1024)).toFixed(1)} MB (limit ${Math.round(PRODUCT_MODEL_MAX_BYTES / (1024 * 1024))} MB).`,
    );
  }

  if (!didOptimize) return;

  console.info(
    `[admin] GLB optimized in storage: ${originalBytes} → ${optimizedBytes} bytes (${storagePath})`,
  );

  const { error: uploadError } = await supabase.storage
    .from(PRODUCT_MODEL_BUCKET)
    .upload(storagePath, buffer, {
      upsert: true,
      contentType: "model/gltf-binary",
    });
  if (uploadError) throw uploadError;
}

export async function getProductModelMedia(productId: string): Promise<ProductModelMedia | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("product_media")
    .select("id, product_id, storage_path, public_url")
    .eq("product_id", productId)
    .eq("kind", "glb")
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as DbModelMediaRow;
  return {
    id: row.id,
    productId: row.product_id,
    storagePath: row.storage_path,
    publicUrl: row.public_url,
    fileName: fileNameFromPath(row.storage_path),
  };
}

export type ModelUploadSession = {
  storagePath: string;
  publicUrl: string;
  signedUrl: string;
  token: string;
  contentType: string;
};

export async function createProductModelUploadSession(
  productId: string,
  fileName: string,
  fileSize: number,
): Promise<ModelUploadSession> {
  const uploadMax = getProductModelUploadMaxBytes(fileName);
  if (fileSize <= 0 || fileSize > uploadMax) {
    throw new Error(`File exceeds the ${Math.round(uploadMax / 1024 / 1024)} MB upload limit`);
  }

  const supabase = createSupabaseAdminClient();
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("slug")
    .eq("id", productId)
    .maybeSingle();

  if (productError) throw productError;
  if (!product?.slug) throw new Error("Product not found");

  const storagePath = buildProductModelStoragePath(product.slug, fileName);
  const { data, error } = await supabase.storage
    .from(PRODUCT_MODEL_BUCKET)
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
    publicUrl: buildProductModelPublicUrl(publicEnv.supabaseUrl, storagePath),
    signedUrl: data.signedUrl,
    token: data.token,
    contentType: getProductModelMimeType(fileName),
  };
}

async function removeStorageObject(storagePath: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage.from(PRODUCT_MODEL_BUCKET).remove([storagePath]);
  if (error) throw error;
}

type RegisterProductModelOptions = {
  skipOptimize?: boolean;
};

export async function registerProductModelMedia(
  productId: string,
  storagePath: string,
  publicUrl: string,
  altText?: string | null,
  options: RegisterProductModelOptions = {},
): Promise<ProductModelMedia> {
  if (!options.skipOptimize && process.env.VERCEL !== "1") {
    try {
      await optimizeGlbInStorage(storagePath);
    } catch (error) {
      console.warn("[admin] GLB optimization skipped:", error);
    }
  }

  const supabase = createSupabaseAdminClient();

  const { data: existingRows, error: listError } = await supabase
    .from("product_media")
    .select("id, storage_path")
    .eq("product_id", productId)
    .eq("kind", "glb");

  if (listError) throw listError;

  for (const row of existingRows ?? []) {
    const oldPath = (row as { storage_path: string }).storage_path;
    if (
      oldPath &&
      oldPath !== storagePath &&
      !isExternalProductModelStoragePath(oldPath)
    ) {
      try {
        await removeStorageObject(oldPath);
      } catch (error) {
        console.warn("[admin] could not delete previous model file:", error);
      }
    }
  }

  if (existingRows?.length) {
    const { error: deleteError } = await supabase
      .from("product_media")
      .delete()
      .eq("product_id", productId)
      .eq("kind", "glb");
    if (deleteError) throw deleteError;
  }

  const { data, error: insertError } = await supabase
    .from("product_media")
    .insert({
      product_id: productId,
      kind: "glb",
      storage_bucket: PRODUCT_MODEL_BUCKET,
      storage_path: storagePath,
      public_url: publicUrl,
      alt_text: altText ?? null,
      sort_order: 100,
      is_primary: false,
    })
    .select("id, product_id, storage_path, public_url")
    .single();

  if (insertError) throw insertError;

  const row = data as DbModelMediaRow;
  return {
    id: row.id,
    productId: row.product_id,
    storagePath: row.storage_path,
    publicUrl: row.public_url,
    fileName: fileNameFromPath(row.storage_path),
  };
}

export async function deleteProductModelMedia(productId: string): Promise<void> {
  const existing = await getProductModelMedia(productId);
  if (!existing) return;

  const supabase = createSupabaseAdminClient();
  const { error: deleteRowError } = await supabase
    .from("product_media")
    .delete()
    .eq("id", existing.id);

  if (deleteRowError) throw deleteRowError;

  if (!isExternalProductModelStoragePath(existing.storagePath)) {
    try {
      await removeStorageObject(existing.storagePath);
    } catch (error) {
      console.warn("[admin] could not delete model storage object:", error);
    }
  }
}

export async function registerExternalProductModelUrl(
  productId: string,
  publicUrl: string,
  altText?: string | null,
): Promise<ProductModelMedia> {
  const trimmedUrl = publicUrl.trim();
  if (!isAllowedProductModelUrl(trimmedUrl)) {
    throw new Error("Enter a valid http(s) URL ending in .glb, .gltf, or .usdz");
  }

  const supabase = createSupabaseAdminClient();
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("slug")
    .eq("id", productId)
    .maybeSingle();

  if (productError) throw productError;
  if (!product?.slug) throw new Error("Product not found");

  const storagePath = buildExternalProductModelStoragePath(product.slug, trimmedUrl);

  const { data: existingRows, error: listError } = await supabase
    .from("product_media")
    .select("id, storage_path")
    .eq("product_id", productId)
    .eq("kind", "glb");

  if (listError) throw listError;

  for (const row of existingRows ?? []) {
    const oldPath = (row as { storage_path: string }).storage_path;
    if (oldPath && !isExternalProductModelStoragePath(oldPath)) {
      try {
        await removeStorageObject(oldPath);
      } catch (error) {
        console.warn("[admin] could not delete previous model file:", error);
      }
    }
  }

  if (existingRows?.length) {
    const { error: deleteError } = await supabase
      .from("product_media")
      .delete()
      .eq("product_id", productId)
      .eq("kind", "glb");
    if (deleteError) throw deleteError;
  }

  const { data, error: insertError } = await supabase
    .from("product_media")
    .insert({
      product_id: productId,
      kind: "glb",
      storage_bucket: PRODUCT_MODEL_BUCKET,
      storage_path: storagePath,
      public_url: trimmedUrl,
      alt_text: altText ?? null,
      sort_order: 100,
      is_primary: false,
    })
    .select("id, product_id, storage_path, public_url")
    .single();

  if (insertError) throw insertError;

  const row = data as DbModelMediaRow;
  return {
    id: row.id,
    productId: row.product_id,
    storagePath: row.storage_path,
    publicUrl: row.public_url,
    fileName: fileNameFromModelUrl(trimmedUrl),
  };
}

export function mapProductModelError(error: unknown): string {
  if (!error || typeof error !== "object") return "Unknown error";
  const record = error as { message?: string };
  return record.message ?? "Model operation failed";
}