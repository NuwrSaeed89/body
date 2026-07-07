import { requireAdminApiReadAccess } from "@/lib/admin/admin-api-guard";
import { ADMIN_MEDIA_BUCKET } from "@/lib/admin/media/constants";
import { getAdminMediaData } from "@/lib/admin/media/get-admin-media-data";
import { normalizeMediaPath } from "@/lib/admin/media/list-media";

export async function GET(request: Request) {
  const auth = await requireAdminApiReadAccess();
  if (auth instanceof Response) return auth;

  const { searchParams } = new URL(request.url);
  const path = normalizeMediaPath(searchParams.get("path") ?? "");
  const bucket = searchParams.get("bucket")?.trim() || ADMIN_MEDIA_BUCKET;

  try {
    const data = await getAdminMediaData(path, bucket);
    return Response.json(data);
  } catch (error) {
    console.error("[admin] media API failed:", error);
    return Response.json({ error: "Could not load media" }, { status: 500 });
  }
}
