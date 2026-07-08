import { normalizeHex } from "./color-palette";
import type { ColorWriteInput } from "./types";

export type ColorValidationResult =
  | { ok: true; data: ColorWriteInput }
  | { ok: false; error: string };

function readString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

export function parseColorWriteBody(body: unknown): ColorValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body" };
  }

  const raw = body as Record<string, unknown>;
  const hexRaw = readString(raw.hex);
  if (!hexRaw) return { ok: false, error: "Hex color is required" };

  const hex = normalizeHex(hexRaw);
  if (!hex) return { ok: false, error: "Hex must be a 6-digit color like #1A2B3C" };

  const name = readString(raw.name);
  if (!name) return { ok: false, error: "Color name is required" };

  const code = readString(raw.code) ?? undefined;
  if (code && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(code)) {
    return { ok: false, error: "Code must be lowercase letters, numbers, and hyphens" };
  }

  return {
    ok: true,
    data: { hex, name, code },
  };
}
