import { requireAdminApiAccess } from "@/lib/admin/admin-api-guard";
import {
  getProductModelExtension,
  PRODUCT_MODEL_MAX_BYTES,
} from "@/lib/admin/products/model-formats";
import {
  createProductModelUploadSession,
  mapProductModelError,
} from "@/lib/admin/products/product-model-media";

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

  if (!getProductModelExtension(fileName)) {
    return Response.json({ error: "Unsupported 3D format. Use GLB, GLTF, or USDZ." }, { status: 400 });
  }

  if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > PRODUCT_MODEL_MAX_BYTES) {
    return Response.json({ error: "File exceeds the 50 MB upload limit" }, { status: 400 });
  }

  try {
    const session = await createProductModelUploadSession(id, fileName, fileSize);
    return Response.json(session);
  } catch (error) {
    console.error("[admin] create model upload session failed:", error);
    return Response.json({ error: mapProductModelError(error) }, { status: 500 });
  }
}
