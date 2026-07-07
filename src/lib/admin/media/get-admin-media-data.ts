import { shouldUseAdminMock } from "@/lib/admin/should-use-mock";
import { ADMIN_MEDIA_BUCKET } from "./constants";
import { getMockMediaListing, listMediaAtPath, normalizeMediaPath } from "./list-media";
import type { AdminMediaData } from "./types";

export async function getAdminMediaData(
  path: string,
  bucket = ADMIN_MEDIA_BUCKET,
): Promise<AdminMediaData> {
  const normalizedPath = normalizeMediaPath(path);

  if (shouldUseAdminMock()) {
    return {
      source: "mock",
      listing: getMockMediaListing(normalizedPath),
    };
  }

  try {
    const listing = await listMediaAtPath(bucket, normalizedPath);
    return {
      source: "supabase",
      listing,
    };
  } catch (error) {
    console.error("[admin] media list failed:", error);
    return {
      source: "mock",
      listing: getMockMediaListing(normalizedPath),
    };
  }
}
