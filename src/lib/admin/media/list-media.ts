import { publicEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ADMIN_MEDIA_BUCKET } from "./constants";
import type { MediaFileItem, MediaFileKind, MediaFolderItem, MediaListing } from "./types";

type StorageObjectRow = {
  name: string;
  id: string | null;
  metadata: {
    mimetype?: string;
    size?: number;
    lastModified?: string;
  } | null;
  updated_at?: string | null;
  created_at?: string | null;
};

export function normalizeMediaPath(path: string): string {
  return path.replace(/^\/+|\/+$/g, "");
}

export function joinMediaPath(base: string, segment: string): string {
  const parent = normalizeMediaPath(base);
  const child = segment.replace(/^\/+|\/+$/g, "");
  if (!parent) return child;
  if (!child) return parent;
  return `${parent}/${child}`;
}

export function splitMediaPath(path: string): string[] {
  return normalizeMediaPath(path).split("/").filter(Boolean);
}

export function buildMediaPublicUrl(bucket: string, storagePath: string): string {
  const base = publicEnv.supabaseUrl.replace(/\/$/, "");
  const encodedPath = storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${base}/storage/v1/object/public/${bucket}/${encodedPath}`;
}

function detectFileKind(name: string, mimeType: string | null): MediaFileKind {
  const lower = name.toLowerCase();
  if (
    mimeType?.startsWith("image/") ||
    /\.(png|jpe?g|webp|gif|svg)$/.test(lower)
  ) {
    return "image";
  }
  if (
    mimeType === "model/gltf-binary" ||
    mimeType === "model/gltf+json" ||
    mimeType === "model/vnd.usdz+zip" ||
    /\.(glb|gltf|usdz)$/.test(lower)
  ) {
    return "model";
  }
  return "other";
}

function mapStorageRows(bucket: string, path: string, rows: StorageObjectRow[]): MediaListing {
  const folders: MediaFolderItem[] = [];
  const files: MediaFileItem[] = [];

  for (const row of rows) {
    if (!row.name || row.name === ".emptyFolderPlaceholder") continue;

    if (row.id === null) {
      folders.push({
        name: row.name,
        path: joinMediaPath(path, row.name),
      });
      continue;
    }

    const storagePath = joinMediaPath(path, row.name);
    const mimeType = row.metadata?.mimetype ?? null;

    files.push({
      name: row.name,
      path: storagePath,
      publicUrl: buildMediaPublicUrl(bucket, storagePath),
      size: Number(row.metadata?.size ?? 0),
      mimeType,
      updatedAt: row.updated_at ?? row.metadata?.lastModified ?? row.created_at ?? null,
      kind: detectFileKind(row.name, mimeType),
    });
  }

  folders.sort((a, b) => a.name.localeCompare(b.name));
  files.sort((a, b) => a.name.localeCompare(b.name));

  return {
    bucket,
    path: normalizeMediaPath(path),
    folders,
    files,
  };
}

const MOCK_TREE: Record<string, MediaListing> = {
  "": {
    bucket: ADMIN_MEDIA_BUCKET,
    path: "",
    folders: [
      { name: "products", path: "products" },
      { name: "seed", path: "seed" },
    ],
    files: [],
  },
  products: {
    bucket: ADMIN_MEDIA_BUCKET,
    path: "products",
    folders: [{ name: "sculpt-leggings", path: "products/sculpt-leggings" }],
    files: [],
  },
  "products/sculpt-leggings": {
    bucket: ADMIN_MEDIA_BUCKET,
    path: "products/sculpt-leggings",
    folders: [],
    files: [
      {
        name: "model-demo.glb",
        path: "products/sculpt-leggings/model-demo.glb",
        publicUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
        size: 1_280_000,
        mimeType: "model/gltf-binary",
        updatedAt: new Date().toISOString(),
        kind: "model",
      },
    ],
  },
  seed: {
    bucket: ADMIN_MEDIA_BUCKET,
    path: "seed",
    folders: [{ name: "sculpt-leggings", path: "seed/sculpt-leggings" }],
    files: [],
  },
  "seed/sculpt-leggings": {
    bucket: ADMIN_MEDIA_BUCKET,
    path: "seed/sculpt-leggings",
    folders: [],
    files: [
      {
        name: "hero.webp",
        path: "seed/sculpt-leggings/hero.webp",
        publicUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAKi6tjJouWa4BgbdkKhv-C3PAMsdW1-LYKU6mJTzdM-kCAbva8AoOix8BibarIzuPEXdxLAa9_Mb8PideBUgKfk-REhTv1hu2PoXaxovA33HGeiDjvVGgzpcCYEtctDTLJuUFsS4-dpGWLoQl4KwgRAdGJla3gBwQ6xbpzw6XtVEUYKKfm4TY-1LyRrd9qZg2R-ynXifBYAZ8kjfYsX7PMH3T0rNamaKBAawz7LQSrDWLN7mbcvkxGVG-F1b-Kc0bpHvWok_54PVY",
        size: 245_000,
        mimeType: "image/webp",
        updatedAt: new Date().toISOString(),
        kind: "image",
      },
    ],
  },
};

export function getMockMediaListing(path: string): MediaListing {
  const normalized = normalizeMediaPath(path);
  return (
    MOCK_TREE[normalized] ?? {
      bucket: ADMIN_MEDIA_BUCKET,
      path: normalized,
      folders: [],
      files: [],
    }
  );
}

export async function listMediaAtPath(
  bucket: string,
  path: string,
): Promise<MediaListing> {
  const supabase = createSupabaseAdminClient();
  const normalized = normalizeMediaPath(path);

  const { data, error } = await supabase.storage.from(bucket).list(normalized, {
    limit: 200,
    sortBy: { column: "name", order: "asc" },
  });

  if (error) throw error;

  return mapStorageRows(bucket, normalized, (data ?? []) as StorageObjectRow[]);
}
