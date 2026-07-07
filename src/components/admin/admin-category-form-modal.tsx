"use client";

import { useEffect, useState } from "react";
import { CATEGORY_LOCALES } from "@/lib/admin/categories/constants";
import type { CategoryDetail } from "@/lib/admin/categories/types";
import type { CategoryLocale } from "@/lib/admin/categories/constants";
import { slugifyProductName } from "@/lib/admin/products/slug";
import {
  adminCheckboxClassName,
  adminFieldClassName,
  adminLabelClassName,
} from "./admin-form-styles";

export type CategoryFormValues = {
  slug: string;
  sortOrder: string;
  isActive: boolean;
  translations: Record<CategoryLocale, string>;
};

type AdminCategoryFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  initial?: CategoryDetail | null;
  onClose: () => void;
  onSaved: () => void;
};

const EMPTY_TRANSLATIONS = Object.fromEntries(
  CATEGORY_LOCALES.map((locale) => [locale, ""]),
) as Record<CategoryLocale, string>;

const EMPTY_FORM: CategoryFormValues = {
  slug: "",
  sortOrder: "0",
  isActive: true,
  translations: { ...EMPTY_TRANSLATIONS },
};

const LOCALE_LABELS: Record<CategoryLocale, string> = {
  en: "English",
  sv: "Swedish",
  es: "Spanish",
  de: "German",
};

function toFormValues(category?: CategoryDetail | null): CategoryFormValues {
  if (!category) return EMPTY_FORM;

  const translations = { ...EMPTY_TRANSLATIONS };
  for (const translation of category.translations) {
    translations[translation.locale] = translation.name;
  }

  return {
    slug: category.slug,
    sortOrder: String(category.sortOrder),
    isActive: category.isActive,
    translations,
  };
}

export function AdminCategoryFormModal({
  open,
  mode,
  initial,
  onClose,
  onSaved,
}: AdminCategoryFormModalProps) {
  const [form, setForm] = useState<CategoryFormValues>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(toFormValues(initial));
    setSlugTouched(mode === "edit");
    setError(null);
    requestAnimationFrame(() => setVisible(true));
  }, [open, initial, mode]);

  useEffect(() => {
    if (open) return;
    setVisible(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const updateTranslation = (locale: CategoryLocale, value: string) => {
    setForm((current) => ({
      ...current,
      translations: { ...current.translations, [locale]: value },
    }));
  };

  const handleEnglishNameChange = (name: string) => {
    updateTranslation("en", name);
    if (!slugTouched) {
      setForm((current) => ({ ...current, slug: slugifyProductName(name) }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      slug: form.slug,
      sortOrder: Number(form.sortOrder),
      isActive: form.isActive,
      translations: CATEGORY_LOCALES.reduce<Record<string, string>>((acc, locale) => {
        const name = form.translations[locale].trim();
        if (name) acc[locale] = name;
        return acc;
      }, {}),
    };

    const url =
      mode === "create" ? "/api/admin/categories" : `/api/admin/categories/${initial?.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(body.error ?? "Save failed");
        return;
      }
      onSaved();
      onClose();
    } catch {
      setError("Network error — could not save category");
    } finally {
      setSubmitting(false);
    }
  };

  const title = mode === "create" ? "Add Category" : "Edit Category";

  return (
    <div className="fixed inset-0 z-[60]" role="presentation">
      <button
        type="button"
        aria-label="Close category drawer"
        onClick={onClose}
        className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-form-title"
        className={`absolute right-0 top-0 flex h-[100dvh] w-full max-w-xl flex-col border-l border-outline-variant bg-surface-bright shadow-2xl transition-transform duration-300 ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-outline-variant p-4 sm:p-6 md:p-8">
          <h3 id="category-form-title" className="text-lg font-semibold text-primary">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="material-symbols-outlined rounded-full p-2 transition-colors hover:bg-surface-container"
            aria-label="Close"
          >
            close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-grow space-y-6 overflow-y-auto p-4 sm:space-y-8 sm:p-6 md:p-8">
            {error && (
              <p className="rounded-lg border border-outline-variant bg-surface-container-high px-4 py-3 text-sm text-primary">
                {error}
              </p>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <div className="sm:col-span-2">
                <label className={adminLabelClassName} htmlFor="category-name-en">
                  Name (English) *
                </label>
                <input
                  id="category-name-en"
                  value={form.translations.en}
                  onChange={(event) => handleEnglishNameChange(event.target.value)}
                  required
                  className={adminFieldClassName}
                />
              </div>

              <div>
                <label className={adminLabelClassName} htmlFor="category-slug">
                  Slug
                </label>
                <input
                  id="category-slug"
                  value={form.slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    setForm((current) => ({ ...current, slug: event.target.value }));
                  }}
                  required
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                  className={adminFieldClassName}
                />
              </div>

              <div>
                <label className={adminLabelClassName} htmlFor="category-sort-order">
                  Sort Order
                </label>
                <input
                  id="category-sort-order"
                  type="number"
                  min={0}
                  step={1}
                  value={form.sortOrder}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, sortOrder: event.target.value }))
                  }
                  required
                  className={adminFieldClassName}
                />
              </div>

              <div className="flex items-center gap-3 sm:col-span-2">
                <input
                  id="category-active"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, isActive: event.target.checked }))
                  }
                  className={adminCheckboxClassName}
                />
                <label htmlFor="category-active" className="text-sm text-on-surface">
                  Visible in shop navigation
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
                Translations
              </p>
              {CATEGORY_LOCALES.filter((locale) => locale !== "en").map((locale) => (
                <div key={locale}>
                  <label className={adminLabelClassName} htmlFor={`category-name-${locale}`}>
                    {LOCALE_LABELS[locale]}
                  </label>
                  <input
                    id={`category-name-${locale}`}
                    value={form.translations[locale]}
                    onChange={(event) => updateTranslation(locale, event.target.value)}
                    className={adminFieldClassName}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 border-t border-outline-variant p-4 sm:p-6 md:p-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-outline-variant px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-primary transition-colors hover:bg-surface-container"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Saving…" : mode === "create" ? "Create Category" : "Save Changes"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
