import { requireAdminApiAccess } from "@/lib/admin/admin-api-guard";
import {
  listProductImages,
  mapProductImageError,
  registerProductImageMedia,
} from "@/lib/admin/products/product-image-media";
import { revalidatePath } from "next/cache";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAdminApiAccess();
  if (auth instanceof Response) return auth;

  const { id } = await context.params;

  try {
    const images = await listProductImages(id);
    return Response.json({ images });
  } catch (error) {
    console.error("[admin] list product images failed:", error);
    return Response.json({ error: mapProductImageError(error) }, { status: 500 });
  }
}

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
  const storagePath = typeof raw.storagePath === "string" ? raw.storagePath.trim() : "";
  const publicUrl = typeof raw.publicUrl === "string" ? raw.publicUrl.trim() : "";

  if (!storagePath || !publicUrl) {
    return Response.json({ error: "storagePath and publicUrl are required" }, { status: 400 });
  }

  try {
    const image = await registerProductImageMedia(id, storagePath, publicUrl);
    revalidatePath("/[locale]/admin/products", "page");
    revalidatePath("/[locale]/shop", "page");
    return Response.json({ image }, { status: 201 });
  } catch (error) {
    console.error("[admin] register product image failed:", error);
    return Response.json({ error: mapProductImageError(error) }, { status: 500 });
  }
}
