"use client";

export function AdminOrderLabelPrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded border border-neutral-800 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em]"
    >
      Print label
    </button>
  );
}
