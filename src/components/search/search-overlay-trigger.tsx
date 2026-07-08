"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { ShopProduct } from "@/lib/shop-data";
import { MaterialIcon } from "@/components/ui/material-icon";

type SearchOverlayTriggerProps = {
  className?: string;
  ariaLabel?: string;
};

type ProductsResponse = {
  items: ShopProduct[];
};

function buildProductsSearchUrl(locale: string, query: string, limit = 8): string {
  const params = new URLSearchParams({ locale, limit: String(limit) });
  if (query.trim()) params.set("q", query.trim());
  return `/api/products?${params.toString()}`;
}

export function SearchOverlayTrigger({
  className = "",
  ariaLabel = "Search",
}: SearchOverlayTriggerProps) {
  const locale = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ShopProduct[]>([]);
  const [seedSuggestions, setSeedSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function loadSeed() {
      try {
        const response = await fetch(buildProductsSearchUrl(locale, "", 16));
        if (!response.ok) return;
        const data = (await response.json()) as ProductsResponse;
        if (cancelled) return;
        const words = Array.from(
          new Set(
            (data.items ?? [])
              .flatMap((item) => item.name.split(/\s+/))
              .map((word) => word.trim())
              .filter((word) => word.length >= 4)
              .slice(0, 8),
          ),
        );
        setSeedSuggestions(words);
      } catch {
        // no-op: suggestions are optional
      }
    }

    void loadSeed();
    return () => {
      cancelled = true;
    };
  }, [open, locale]);

  useEffect(() => {
    if (!open) return;
    const normalized = query.trim();
    if (!normalized) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(buildProductsSearchUrl(locale, normalized, 8), {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("search failed");
        const data = (await response.json()) as ProductsResponse;
        setResults(data.items ?? []);
      } catch {
        if (!controller.signal.aborted) setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [open, query, locale]);

  const hasQuery = query.trim().length > 0;
  const showEmptyHint = hasQuery && !loading && results.length === 0;
  const tryWords = useMemo(() => seedSuggestions.slice(0, 6), [seedSuggestions]);

  const navigateToShopSearch = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    router.push(`/shop?q=${encodeURIComponent(trimmed)}`);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={className}
        aria-label={ariaLabel}
        onClick={() => setOpen(true)}
      >
        <MaterialIcon name="search" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[70]">
          <button
            type="button"
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Close search"
          />
          <div className="absolute left-1/2 top-[12vh] w-[92vw] max-w-2xl -translate-x-1/2 rounded-xl border border-outline-variant bg-surface p-4 shadow-2xl md:p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
                Product search
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="material-symbols-outlined rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                aria-label="Close search"
              >
                close
              </button>
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                navigateToShopSearch(query);
              }}
              className="mb-3 flex items-center gap-2"
            >
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products..."
                className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-primary outline-none ring-primary focus:ring-1"
              />
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-on-primary"
              >
                Search
              </button>
            </form>

            {!hasQuery && tryWords.length > 0 && (
              <div className="mb-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
                  Try words
                </p>
                <div className="flex flex-wrap gap-2">
                  {tryWords.map((word) => (
                    <button
                      key={word}
                      type="button"
                      onClick={() => setQuery(word)}
                      className="rounded-full border border-outline-variant px-3 py-1 text-xs text-primary hover:bg-surface-container"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <p className="py-3 text-sm text-on-surface-variant">Searching...</p>
            )}

            {hasQuery && results.length > 0 && (
              <ul className="max-h-[50vh] overflow-auto divide-y divide-outline-variant/20">
                {results.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        router.push(`/shop/${item.slug}`);
                        setOpen(false);
                      }}
                      className="flex w-full items-center gap-3 py-3 text-left hover:bg-surface-container-low"
                    >
                      <img
                        src={item.image}
                        alt={item.imageAlt}
                        className="h-12 w-10 rounded object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-primary">{item.name}</p>
                        <p className="truncate text-xs text-on-surface-variant">{item.slug}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {showEmptyHint && (
              <p className="py-3 text-sm text-on-surface-variant">No matching products.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
