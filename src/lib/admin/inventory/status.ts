export type InventoryStatusTone = "primary" | "error" | "muted";

export type InventoryStatus = {
  label: string;
  tone: InventoryStatusTone;
  isLowStock: boolean;
  isOutOfStock: boolean;
};

export function getInventoryStatus(stock: number, lowStockThreshold: number): InventoryStatus {
  const threshold = Math.max(0, lowStockThreshold);
  if (stock <= 0) {
    return { label: "Out of Stock", tone: "muted", isLowStock: false, isOutOfStock: true };
  }
  if (stock <= threshold) {
    return { label: "Low Stock", tone: "error", isLowStock: true, isOutOfStock: false };
  }
  return { label: "In Stock", tone: "primary", isLowStock: false, isOutOfStock: false };
}

export function isLowStockProduct(stock: number, lowStockThreshold: number): boolean {
  return stock > 0 && stock <= Math.max(0, lowStockThreshold);
}

export function isOutOfStockProduct(stock: number): boolean {
  return stock <= 0;
}
