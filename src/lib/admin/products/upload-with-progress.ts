export type UploadProgressHandler = (percent: number) => void;

type UploadWithProgressOptions = {
  url: string;
  method?: "PUT" | "POST";
  file: File;
  headers?: Record<string, string>;
  onProgress?: UploadProgressHandler;
  signal?: AbortSignal;
};

export function uploadWithProgress({
  url,
  method = "PUT",
  file,
  headers = {},
  onProgress,
  signal,
}: UploadWithProgressOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Upload cancelled", "AbortError"));
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open(method, url);

    for (const [key, value] of Object.entries(headers)) {
      xhr.setRequestHeader(key, value);
    }

    const cleanup = () => signal?.removeEventListener("abort", onAbort);
    const onAbort = () => {
      cleanup();
      xhr.abort();
    };

    signal?.addEventListener("abort", onAbort);

    xhr.upload.onprogress = (event) => {
      if (!onProgress || !event.lengthComputable) return;
      const percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
      onProgress(percent);
    };

    xhr.onload = () => {
      cleanup();
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
        return;
      }
      reject(new Error(`Upload failed (${xhr.status})`));
    };

    xhr.onerror = () => {
      cleanup();
      reject(new Error("Network error during upload"));
    };

    xhr.onabort = () => {
      cleanup();
      reject(new DOMException("Upload cancelled", "AbortError"));
    };

    xhr.send(file);
  });
}

export function isUploadAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}
