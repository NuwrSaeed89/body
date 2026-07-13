"use client";

type AdminConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
};

export function AdminConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  onConfirm,
  onCancel,
  busy = false,
}: AdminConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md rounded-xl border border-outline-variant bg-surface p-5 shadow-xl"
      >
        <h3 className="text-base font-semibold text-primary">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg border border-outline-variant px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-on-surface-variant transition-colors hover:bg-surface-container disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition-opacity hover:opacity-90 disabled:opacity-60 ${
              tone === "danger"
                ? "bg-error text-on-error"
                : "bg-primary text-on-primary"
            }`}
          >
            {busy ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
