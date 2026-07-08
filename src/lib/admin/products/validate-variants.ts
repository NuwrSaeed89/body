import type { VariantCellWrite } from "./variant-types";

export type VariantMatrixValidationResult =
  | { ok: true; data: VariantCellWrite[] }
  | { ok: false; error: string };

function readString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function readNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function readBoolean(value: unknown, fallback = true): boolean {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === 1) return true;
  if (value === "false" || value === 0) return false;
  return fallback;
}

export function parseVariantMatrixBody(body: unknown): VariantMatrixValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body" };
  }

  const raw = body as Record<string, unknown>;
  if (!Array.isArray(raw.cells)) {
    return { ok: false, error: "cells must be an array" };
  }

  const cells: VariantCellWrite[] = [];

  for (const item of raw.cells) {
    if (!item || typeof item !== "object") {
      return { ok: false, error: "Each cell must be an object" };
    }

    const cell = item as Record<string, unknown>;
    const sizeId = readString(cell.sizeId);
    const colorId = readString(cell.colorId);
    if (!sizeId || !colorId) {
      return { ok: false, error: "Each cell requires sizeId and colorId" };
    }

    const stockQuantity = readNumber(cell.stockQuantity);
    if (stockQuantity === null || stockQuantity < 0 || !Number.isInteger(stockQuantity)) {
      return { ok: false, error: "stockQuantity must be a non-negative whole number" };
    }

    const sku = readString(cell.sku) ?? "";

    cells.push({
      sizeId,
      colorId,
      sku,
      stockQuantity,
      isActive: readBoolean(cell.isActive, stockQuantity > 0),
    });
  }

  return { ok: true, data: cells };
}
