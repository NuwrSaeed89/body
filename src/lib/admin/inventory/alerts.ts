import type { AdminProductRow } from "@/lib/admin/list-types";
import type { AdminLowStockAlert } from "@/lib/admin/types";
import { isLowStockProduct, isOutOfStockProduct } from "./status";

export type { AdminLowStockAlert };

export function buildLowStockAlerts(products: AdminProductRow[]): AdminLowStockAlert[] {
  return products
    .filter(
      (product) =>
        isOutOfStockProduct(product.stock) ||
        isLowStockProduct(product.stock, product.lowStockThreshold),
    )
    .map((product): AdminLowStockAlert => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold,
      waitingCount: product.waitingCount,
      imageUrl: product.imageUrl,
      status: isOutOfStockProduct(product.stock) ? "out" : "low",
    }))
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "out" ? -1 : 1;
      return a.stock - b.stock;
    });
}

export function countLowStockAlerts(products: AdminProductRow[]): {
  low: number;
  out: number;
  total: number;
} {
  let low = 0;
  let out = 0;
  for (const product of products) {
    if (isOutOfStockProduct(product.stock)) out += 1;
    else if (isLowStockProduct(product.stock, product.lowStockThreshold)) low += 1;
  }
  return { low, out, total: low + out };
}
