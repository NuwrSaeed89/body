import { requireAdminApiAccess } from "@/lib/admin/admin-api-guard";
import {
  deleteProductImageMedia,
  mapProductImageError,
  setPrimaryProductImage,
} from "@/lib/admin/products/product-image-media";
import { revalidatePath } from "next/cache";

type RouteContext = {
  params: Promise<{ id: string; mediaId: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAdminApiAccess();
  if (auth instanceof Response) return auth;

  const { mediaId } = await context.params;

  try {
    await deleteProductImageMedia(mediaId);
    revalidatePath("/[locale]/admin/products", "page");
    revalidatePath("/[locale]/shop", "page");
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[admin] delete product image failed:", error);
    return Response.json({ error: mapProductImageError(error) }, { status: 500 });
  }
}

export async function PATCH(_request: Request, context: RouteContext) {
  const auth = await requireAdminApiAccess();
  if (auth instanceof Response) return auth;

  const { mediaId } = await context.params;

  try {
    const image = await setPrimaryProductImage(mediaId);
    revalidatePath("/[locale]/admin/products", "page");
    revalidatePath("/[locale]/shop", "page");
    return Response.json({ image });
  } catch (error) {
    console.error("[admin] set primary product image failed:", error);
    return Response.json({ error: mapProductImageError(error) }, { status: 500 });
  }
}
