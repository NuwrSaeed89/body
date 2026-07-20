import { revalidatePath } from "next/cache";
import { requireAdminApiAccess } from "@/lib/admin/admin-api-guard";
import {
  deleteProductModelMedia,
  getProductModelMedia,
  mapProductModelError,
  registerExternalProductModelUrl,
  registerProductModelMedia,
} from "@/lib/admin/products/product-model-media";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAdminApiAccess();
  if (auth instanceof Response) return auth;

  const { id } = await context.params;

  try {
    const model = await getProductModelMedia(id);
    if (!model) {
      return Response.json({ model: null });
    }
    return Response.json({ model });
  } catch (error) {
    console.error("[admin] get product model failed:", error);
    return Response.json({ error: mapProductModelError(error) }, { status: 500 });
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
  const alreadyOptimized = raw.alreadyOptimized === true;

  if (!publicUrl) {
    return Response.json({ error: "publicUrl is required" }, { status: 400 });
  }

  try {
    const model = storagePath
      ? await registerProductModelMedia(id, storagePath, publicUrl, null, {
          skipOptimize: alreadyOptimized || process.env.VERCEL === "1",
        })
      : await registerExternalProductModelUrl(id, publicUrl);
    revalidatePath("/[locale]/admin/products", "page");
    revalidatePath("/[locale]/shop", "page");
    return Response.json({ model }, { status: 201 });
  } catch (error) {
    console.error("[admin] register product model failed:", error);
    return Response.json({ error: mapProductModelError(error) }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAdminApiAccess();
  if (auth instanceof Response) return auth;

  const { id } = await context.params;

  try {
    await deleteProductModelMedia(id);
    revalidatePath("/[locale]/admin/products", "page");
    revalidatePath("/[locale]/shop", "page");
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[admin] delete product model failed:", error);
    return Response.json({ error: mapProductModelError(error) }, { status: 500 });
  }
}
