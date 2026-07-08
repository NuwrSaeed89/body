import { requireAdminApiAccess } from "@/lib/admin/admin-api-guard";
import {
  getProductImageExtension,
  PRODUCT_IMAGE_MAX_BYTES,
} from "@/lib/admin/products/image-formats";
import {
  createProductImageUploadSession,
  mapProductImageError,
} from "@/lib/admin/products/product-image-media";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireAdminApiAccess();
  if (auth instanceof Response) return auth;

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  const fileName = typeof raw.fileName === "string" ? raw.fileName.trim() : "";
  const fileSize = typeof raw.fileSize === "number" ? raw.fileSize : Number(raw.fileSize);

  if (!fileName) {
    return Response.json({ error: "fileName is required" }, { status: 400 });
  }

  if (!getProductImageExtension(fileName)) {
    return Response.json({ error: "Unsupported image format. Use JPG, PNG, or WebP." }, { status: 400 });
  }

  if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > PRODUCT_IMAGE_MAX_BYTES) {
    return Response.json({ error: "File exceeds the 10 MB upload limit" }, { status: 400 });
  }

  try {
    const session = await createProductImageUploadSession(id, fileName, fileSize);
    return Response.json(session);
  } catch (error) {
    console.error("[admin] create image upload session failed:", error);
    return Response.json({ error: mapProductImageError(error) }, { status: 500 });
  }
}
