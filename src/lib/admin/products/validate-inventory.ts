export type InventoryWriteInput = {
  stock?: number;
  lowStockThreshold?: number;
};

export type InventoryValidationResult =
  | { ok: true; data: InventoryWriteInput }
  | { ok: false; error: string };

function readNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function parseInventoryWriteBody(body: unknown): InventoryValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body" };
  }

  const raw = body as Record<string, unknown>;
  const hasStock = raw.stock !== undefined;
  const hasThreshold = raw.lowStockThreshold !== undefined;

  if (!hasStock && !hasThreshold) {
    return { ok: false, error: "Provide stock and/or lowStockThreshold" };
  }

  const data: InventoryWriteInput = {};

  if (hasStock) {
    const stock = readNumber(raw.stock);
    if (stock === null || stock < 0 || !Number.isInteger(stock)) {
      return { ok: false, error: "Stock must be a non-negative whole number" };
    }
    data.stock = stock;
  }

  if (hasThreshold) {
    const lowStockThreshold = readNumber(raw.lowStockThreshold);
    if (lowStockThreshold === null || lowStockThreshold < 0 || !Number.isInteger(lowStockThreshold)) {
      return { ok: false, error: "Low stock threshold must be a non-negative whole number" };
    }
    data.lowStockThreshold = lowStockThreshold;
  }

  return { ok: true, data };
}
