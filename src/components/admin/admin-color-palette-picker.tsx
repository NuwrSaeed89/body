"use client";

import { useMemo, useState } from "react";
import {
  FASHION_COLOR_PALETTE,
  normalizeHex,
  slugifyColorCode,
  suggestColorFromHex,
  type PaletteSwatch,
} from "@/lib/admin/colors/color-palette";
import type { AdminColorOption } from "@/lib/admin/products/variant-types";
import { adminFieldClassName, adminLabelClassName } from "./admin-form-styles";

type AdminColorPalettePickerProps = {
  disabled?: boolean;
  existingColors: AdminColorOption[];
  onColorAdded: (color: AdminColorOption) => void;
};

function sameHex(a: string | null | undefined, b: string | null | undefined): boolean {
  const left = normalizeHex(a ?? "");
  const right = normalizeHex(b ?? "");
  return Boolean(left && right && left === right);
}

export function AdminColorPalettePicker({
  disabled = false,
  existingColors,
  onColorAdded,
}: AdminColorPalettePickerProps) {
  const [open, setOpen] = useState(false);
  const [hex, setHex] = useState("#3D3E3F");
  const [name, setName] = useState("Basalt Grey");
  const [nameEdited, setNameEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const codePreview = useMemo(() => slugifyColorCode(name) || "color", [name]);
  const normalizedHex = normalizeHex(hex) ?? "#3D3E3F";

  const pickSwatch = (swatch: PaletteSwatch) => {
    setError(null);
    // Apply the clicked swatch exactly — never fuzzy-match to a neighbor.
    setHex(normalizeHex(swatch.hex) ?? swatch.hex);
    setName(swatch.name);
    setNameEdited(false);
  };

  const handleHexInput = (value: string) => {
    setError(null);
    setHex(value);

    const normalized = normalizeHex(value);
    if (!normalized || nameEdited) return;

    // Keep the typed/custom hex; only suggest a display name (do not replace hex
    // with a different palette color).
    const suggestion = suggestColorFromHex(normalized);
    if (!suggestion) return;
    setName(suggestion.name);
  };

  const handleAdd = async () => {
    if (disabled) return;

    const finalHex = normalizeHex(hex);
    if (!finalHex) {
      setError("Enter a valid hex color (e.g. #1A2B3C).");
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Color name is required.");
      return;
    }

    const duplicate = existingColors.find((color) => sameHex(color.hex, finalHex));
    if (duplicate) {
      onColorAdded(duplicate);
      setOpen(false);
      setError(null);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/colors", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hex: finalHex,
          name: trimmedName,
          code: slugifyColorCode(trimmedName),
        }),
      });

      const data = (await response.json()) as {
        color?: { id: string; code: string; hex: string; name: string };
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to add color");
      }

      if (!data.color) throw new Error("Color missing from response");

      onColorAdded({
        id: data.color.id,
        code: data.color.code,
        hex: data.color.hex,
        name: data.color.name,
      });
      setOpen(false);
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : "Failed to add color");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg border border-dashed border-outline-variant/80 bg-surface p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className={adminLabelClassName}>Add new color</p>
          <p className="text-xs text-on-surface-variant">
            Pick from the palette or use a custom swatch — the name updates automatically.
          </p>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((current) => !current)}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-primary transition-colors hover:bg-primary hover:text-on-primary disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">
            {open ? "expand_less" : "palette"}
          </span>
          {open ? "Close" : "Add color"}
        </button>
      </div>

      {open && (
        <div className="mt-4 space-y-4 border-t border-outline-variant/40 pt-4">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
              Smart palette
            </p>
            <div className="flex flex-wrap gap-2">
              {FASHION_COLOR_PALETTE.map((swatch) => {
                const selected = sameHex(normalizedHex, swatch.hex);
                const alreadyAdded = existingColors.some((color) => sameHex(color.hex, swatch.hex));

                return (
                  <button
                    key={swatch.code}
                    type="button"
                    disabled={disabled}
                    title={`${swatch.name}${alreadyAdded ? " (in catalog)" : ""}`}
                    onClick={() => pickSwatch(swatch)}
                    className={`relative size-9 rounded-full border-2 transition-transform hover:scale-105 disabled:opacity-50 ${
                      selected ? "border-primary ring-2 ring-primary/30" : "border-outline-variant"
                    }`}
                    style={{ backgroundColor: swatch.hex }}
                    aria-label={swatch.name}
                    aria-pressed={selected}
                  >
                    {alreadyAdded && (
                      <span className="material-symbols-outlined absolute -right-1 -top-1 rounded-full bg-surface text-[14px] text-primary shadow-sm">
                        check
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-end">
            <div>
              <label htmlFor="custom-color-picker" className={adminLabelClassName}>
                Custom
              </label>
              <input
                id="custom-color-picker"
                type="color"
                disabled={disabled}
                value={normalizedHex}
                onChange={(event) => handleHexInput(event.target.value)}
                className="mt-2 h-12 w-full min-w-[4.5rem] cursor-pointer rounded-lg border border-outline-variant bg-surface p-1"
                aria-label="Custom color picker"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="custom-color-hex" className={adminLabelClassName}>
                  Hex
                </label>
                <input
                  id="custom-color-hex"
                  type="text"
                  disabled={disabled}
                  value={hex}
                  onChange={(event) => handleHexInput(event.target.value)}
                  placeholder="#3D3E3F"
                  className={`${adminFieldClassName} mt-2 font-mono uppercase`}
                />
              </div>
              <div>
                <label htmlFor="color-name" className={adminLabelClassName}>
                  Display name
                </label>
                <input
                  id="color-name"
                  type="text"
                  disabled={disabled}
                  value={name}
                  onChange={(event) => {
                    setNameEdited(true);
                    setName(event.target.value);
                  }}
                  className={`${adminFieldClassName} mt-2`}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-outline-variant/50 bg-surface-container-low px-3 py-2">
            <span
              className="size-8 shrink-0 rounded-full border border-outline-variant"
              style={{ backgroundColor: normalizedHex }}
              aria-hidden
            />
            <p className="text-xs text-on-surface-variant">
              Selected:{" "}
              <span className="font-semibold text-primary">{name}</span>
              {" · "}
              <span className="font-mono text-primary">{normalizedHex}</span>
              {" · SKU "}
              <span className="font-mono font-semibold text-primary">{codePreview}</span>
            </p>
          </div>

          {error && (
            <p className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-primary">
              {error}
            </p>
          )}

          <button
            type="button"
            disabled={disabled || saving}
            onClick={() => void handleAdd()}
            className="rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Adding…" : "Add to catalog"}
          </button>
        </div>
      )}
    </div>
  );
}
