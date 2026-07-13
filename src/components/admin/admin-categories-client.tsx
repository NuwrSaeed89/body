"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { AdminCategoryRow, CategoryDetail } from "@/lib/admin/categories/types";
import { adminCardToolbarClass } from "./admin-layout-styles";
import { AdminConfirmDialog } from "./admin-confirm-dialog";
import { AdminCategoryFormModal } from "./admin-category-form-modal";
import {
  AdminCategoriesTable,
  AdminCategoryStatusBadge,
} from "./admin-categories-table";

type AdminCategoriesClientProps = {
  categories: AdminCategoryRow[];
  canMutate: boolean;
};

function rowToCategoryDetail(category: AdminCategoryRow): CategoryDetail {
  return {
    id: category.id,
    slug: category.slug,
    sortOrder: category.sortOrder,
    isActive: category.isActive,
    productCount: category.productCount,
    translations: Object.entries(category.translations).map(([locale, name]) => ({
      locale: locale as CategoryDetail["translations"][number]["locale"],
      name,
    })),
  };
}

export function AdminCategoriesClient({ categories, canMutate }: AdminCategoriesClientProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingCategory, setEditingCategory] = useState<CategoryDetail | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteCategory, setConfirmDeleteCategory] = useState<AdminCategoryRow | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "hidden">("all");

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return categories.filter((category) => {
      const matchesQuery =
        !query ||
        category.name.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && category.isActive) ||
        (statusFilter === "hidden" && !category.isActive);
      return matchesQuery && matchesStatus;
    });
  }, [categories, searchQuery, statusFilter]);

  const emptyMessage =
    categories.length === 0
      ? "No categories found. Run database/mbody_init.sql to seed the catalog."
      : "No categories match your filters.";

  const openCreate = () => {
    setFormMode("create");
    setEditingCategory(null);
    setFormOpen(true);
    setActionError(null);
  };

  const openEdit = (category: AdminCategoryRow) => {
    setFormMode("edit");
    setEditingCategory(rowToCategoryDetail(category));
    setFormOpen(true);
    setActionError(null);
  };

  const handleDelete = async (category: AdminCategoryRow) => {
    setDeletingId(category.id);
    setActionError(null);

    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, { method: "DELETE" });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        setActionError(body.error ?? "Delete failed");
        return;
      }
      router.refresh();
    } catch {
      setActionError("Network error — could not delete category");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <section className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h2 className="mb-1 text-xl font-medium tracking-tight text-primary sm:text-2xl">
            Shop Categories
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-on-surface-variant sm:text-base">
            Organize products into navigation categories with localized names.
          </p>
        </div>
        {canMutate ? (
          <button
            type="button"
            onClick={openCreate}
            className="flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-on-primary transition-opacity hover:opacity-90 sm:w-auto"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Category
          </button>
        ) : (
          <p className="text-sm text-on-surface-variant">
            Enable live Supabase to create, edit, or delete categories.
          </p>
        )}
      </section>

      {actionError && (
        <p className="mb-4 rounded-lg border border-outline-variant bg-surface-container-high px-4 py-3 text-sm text-primary">
          {actionError}
        </p>
      )}

      <article className="mb-6 overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest shadow-[0_30px_50px_-12px_rgba(18,18,18,0.03)] sm:mb-8">
        <div className={adminCardToolbarClass}>
          <div className="relative w-full sm:max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              search
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by name or slug..."
              className="w-full rounded-lg border-none bg-surface-container-low py-2 pl-10 pr-4 text-sm transition-all focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
            className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-primary sm:w-auto"
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>

        <ul className="divide-y divide-outline-variant/20 md:hidden">
          {filteredCategories.length === 0 ? (
            <li className="px-4 py-10 text-center text-sm text-on-surface-variant">{emptyMessage}</li>
          ) : (
            filteredCategories.map((category) => (
              <li
                key={category.id}
                className={`px-4 py-4 ${canMutate ? "cursor-pointer active:bg-surface-container-low/50" : ""}`}
                onClick={() => canMutate && openEdit(category)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-primary">{category.name}</p>
                    <p className="mt-0.5 truncate font-mono text-xs text-on-surface-variant">
                      {category.slug}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <AdminCategoryStatusBadge active={category.isActive} />
                      <span className="text-xs text-on-surface-variant">
                        Order {category.sortOrder}
                      </span>
                      <span className="text-xs text-on-surface-variant">
                        {category.productCount} products
                      </span>
                    </div>
                  </div>
                  {canMutate && (
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          openEdit(category);
                        }}
                        className="material-symbols-outlined rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                        aria-label={`Edit ${category.name}`}
                      >
                        edit
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setConfirmDeleteCategory(category);
                        }}
                        disabled={deletingId === category.id}
                        className="material-symbols-outlined rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-error disabled:opacity-50"
                        aria-label={`Delete ${category.name}`}
                      >
                        {deletingId === category.id ? "hourglass_empty" : "delete"}
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>

        <div className="hidden md:block">
          <AdminCategoriesTable
            categories={filteredCategories}
            emptyMessage={emptyMessage}
            canMutate={canMutate}
            deletingId={deletingId}
            onEdit={openEdit}
            onDelete={(category) => setConfirmDeleteCategory(category)}
          />
        </div>
      </article>

      <AdminCategoryFormModal
        open={formOpen}
        mode={formMode}
        initial={editingCategory}
        onClose={() => setFormOpen(false)}
        onSaved={() => router.refresh()}
      />

      <AdminConfirmDialog
        open={Boolean(confirmDeleteCategory)}
        title="Delete category?"
        description={
          confirmDeleteCategory
            ? confirmDeleteCategory.productCount > 0
              ? `Delete "${confirmDeleteCategory.name}"? ${confirmDeleteCategory.productCount} product(s) will be unlinked from this category.`
              : `Delete "${confirmDeleteCategory.name}"?`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        tone="danger"
        busy={Boolean(confirmDeleteCategory && deletingId === confirmDeleteCategory.id)}
        onCancel={() => setConfirmDeleteCategory(null)}
        onConfirm={() => {
          const target = confirmDeleteCategory;
          setConfirmDeleteCategory(null);
          if (target) void handleDelete(target);
        }}
      />
    </>
  );
}
