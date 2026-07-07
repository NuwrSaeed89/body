"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import type { AdminMediaData, MediaFileItem, MediaFolderItem } from "@/lib/admin/media/types";
import { splitMediaPath } from "@/lib/admin/media/list-media";
import { adminCardToolbarClass } from "./admin-layout-styles";
import { AdminMediaContentSkeleton } from "./admin-media-list-skeleton";
import { AdminSourceBadge } from "./admin-source-badge";

type AdminMediaBrowserProps = {
  initialData: AdminMediaData;
};

function formatBytes(bytes: number): string {
  if (bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

function fileIcon(kind: MediaFileItem["kind"]): string {
  switch (kind) {
    case "image":
      return "image";
    case "model":
      return "view_in_ar";
    default:
      return "draft";
  }
}

function MediaBreadcrumbs({
  path,
  bucket,
  onNavigate,
}: {
  path: string;
  bucket: string;
  onNavigate: (nextPath: string) => void;
}) {
  const segments = splitMediaPath(path);

  return (
    <nav
      className="flex flex-wrap items-center gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-on-surface-variant"
      aria-label="Media path"
    >
      <button
        type="button"
        onClick={() => onNavigate("")}
        className="rounded px-1.5 py-0.5 transition-colors hover:bg-surface-container hover:text-primary"
      >
        {bucket}
      </button>
      {segments.map((segment, index) => {
        const segmentPath = segments.slice(0, index + 1).join("/");
        const isLast = index === segments.length - 1;
        return (
          <span key={segmentPath} className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            {isLast ? (
              <span className="text-primary">{segment}</span>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate(segmentPath)}
                className="rounded px-1.5 py-0.5 transition-colors hover:bg-surface-container hover:text-primary"
              >
                {segment}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}

function FolderCard({
  folder,
  onOpen,
}: {
  folder: MediaFolderItem;
  onOpen: (path: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(folder.path)}
      className="flex flex-col items-center gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4 text-center transition-colors hover:border-primary/40 hover:bg-surface-container-low"
    >
      <div className="flex size-14 items-center justify-center rounded-lg bg-secondary-container">
        <span className="material-symbols-outlined text-3xl text-on-secondary-container">folder</span>
      </div>
      <span className="line-clamp-2 w-full text-sm font-medium text-primary">{folder.name}</span>
    </button>
  );
}

function FileCard({ file }: { file: MediaFileItem }) {
  const [copied, setCopied] = useState(false);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(file.publicUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt("Copy URL:", file.publicUrl);
    }
  };

  return (
    <article className="overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest">
      <div className="relative flex aspect-[4/3] items-center justify-center bg-surface-container-low">
        {file.kind === "image" ? (
          <img
            src={file.publicUrl}
            alt={file.name}
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="material-symbols-outlined text-5xl text-on-surface-variant">
            {fileIcon(file.kind)}
          </span>
        )}
      </div>
      <div className="space-y-2 p-3">
        <p className="truncate text-sm font-medium text-primary" title={file.name}>
          {file.name}
        </p>
        <p className="text-xs text-on-surface-variant">
          {formatBytes(file.size)} · {formatDate(file.updatedAt)}
        </p>
        <div className="flex gap-2">
          <a
            href={file.publicUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 rounded-lg border border-outline-variant px-2 py-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-primary transition-colors hover:bg-surface-container"
          >
            Open
          </a>
          <button
            type="button"
            onClick={() => void copyUrl()}
            className="flex-1 rounded-lg border border-outline-variant px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-primary transition-colors hover:bg-surface-container"
          >
            {copied ? "Copied" : "Copy URL"}
          </button>
        </div>
      </div>
    </article>
  );
}

export function AdminMediaBrowser({ initialData }: AdminMediaBrowserProps) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [path, setPath] = useState(initialData.listing.path);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPath = useCallback(async (nextPath: string) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        path: nextPath,
        bucket: initialData.listing.bucket,
      });
      const response = await fetch(`/api/admin/media?${params.toString()}`);
      const body = (await response.json()) as AdminMediaData & { error?: string };
      if (!response.ok) {
        throw new Error(body.error ?? "Could not load folder");
      }
      setData(body);
      setPath(body.listing.path);
      const query = body.listing.path ? `?path=${encodeURIComponent(body.listing.path)}` : "";
      router.replace(`/admin/media${query}` as "/admin/media", { scroll: false });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load folder");
    } finally {
      setLoading(false);
    }
  }, [initialData.listing.bucket, router]);

  useEffect(() => {
    setData(initialData);
    setPath(initialData.listing.path);
  }, [initialData]);

  const { listing } = data;
  const isEmpty = listing.folders.length === 0 && listing.files.length === 0;
  const parentPath = splitMediaPath(path).slice(0, -1).join("/");

  return (
    <>
      <section className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-medium tracking-tight text-primary sm:text-2xl">Media</h2>
            <AdminSourceBadge source={data.source} />
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-on-surface-variant sm:text-base">
            Browse Supabase Storage bucket folders and files — same structure as the dashboard.
          </p>
        </div>
      </section>

      <article className="overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest shadow-[0_30px_50px_-12px_rgba(18,18,18,0.03)]">
        <div className={adminCardToolbarClass}>
          <MediaBreadcrumbs path={path} bucket={listing.bucket} onNavigate={loadPath} />
          <div className="flex gap-2">
            {path && (
              <button
                type="button"
                onClick={() => void loadPath(parentPath)}
                disabled={loading}
                className="flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition-colors hover:bg-surface-container disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                Up
              </button>
            )}
            <button
              type="button"
              onClick={() => void loadPath(path)}
              disabled={loading}
              className="flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition-colors hover:bg-surface-container disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              Refresh
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5 md:p-6">
          {error && (
            <p className="mb-4 rounded-lg border border-outline-variant bg-surface-container-high px-4 py-3 text-sm text-primary">
              {error}
            </p>
          )}

          {loading ? (
            <AdminMediaContentSkeleton />
          ) : isEmpty ? (
            <p className="py-16 text-center text-sm text-on-surface-variant">
              This folder is empty.
            </p>
          ) : (
            <div className="space-y-8">
              {listing.folders.length > 0 && (
                <section>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
                    Folders ({listing.folders.length})
                  </h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {listing.folders.map((folder) => (
                      <FolderCard key={folder.path} folder={folder} onOpen={loadPath} />
                    ))}
                  </div>
                </section>
              )}

              {listing.files.length > 0 && (
                <section>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
                    Files ({listing.files.length})
                  </h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {listing.files.map((file) => (
                      <FileCard key={file.path} file={file} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </article>
    </>
  );
}
