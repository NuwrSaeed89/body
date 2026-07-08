export type MediaFileKind = "image" | "model" | "other";

export type MediaFolderItem = {
  name: string;
  path: string;
};

export type MediaFileItem = {
  name: string;
  path: string;
  publicUrl: string;
  size: number;
  mimeType: string | null;
  updatedAt: string | null;
  kind: MediaFileKind;
};

export type MediaListing = {
  bucket: string;
  path: string;
  folders: MediaFolderItem[];
  files: MediaFileItem[];
  directSizeBytes: number;
  totalSizeBytes: number;
};

export type AdminMediaData = {
  source: "supabase" | "mock";
  listing: MediaListing;
};
