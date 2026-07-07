import { CATEGORY_LOCALES } from "./constants";
import type { CategoryWriteInput } from "./types";

export type CategoryValidationResult =
  | { ok: true; data: CategoryWriteInput }
  | { ok: false; error: string };

function readString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function readBoolean(value: unknown, fallback = true): boolean {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === 1) return true;
  if (value === "false" || value === 0) return false;
  return fallback;
}

function readNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function parseCategoryWriteBody(body: unknown): CategoryValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body" };
  }

  const raw = body as Record<string, unknown>;

  const slug = readString(raw.slug);
  if (!slug) return { ok: false, error: "Slug is required" };
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return { ok: false, error: "Slug must be lowercase letters, numbers, and hyphens" };
  }

  const sortOrder = readNumber(raw.sortOrder);
  if (sortOrder === null || sortOrder < 0 || !Number.isInteger(sortOrder)) {
    return { ok: false, error: "Sort order must be a non-negative whole number" };
  }

  const isActive = readBoolean(raw.isActive, true);

  const translationsInput = raw.translations;
  if (!translationsInput || typeof translationsInput !== "object") {
    return { ok: false, error: "Translations are required" };
  }

  const translations: CategoryWriteInput["translations"] = [];
  for (const locale of CATEGORY_LOCALES) {
    const name = readString((translationsInput as Record<string, unknown>)[locale]);
    if (name) {
      translations.push({ locale, name });
    }
  }

  const englishName = translations.find((t) => t.locale === "en")?.name;
  if (!englishName) {
    return { ok: false, error: "English name is required" };
  }

  return {
    ok: true,
    data: {
      slug,
      sortOrder,
      isActive,
      translations,
    },
  };
}
