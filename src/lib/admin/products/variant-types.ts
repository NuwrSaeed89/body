export type AdminSizeOption = {
  id: string;
  code: string;
  sortOrder: number;
};

export type AdminColorOption = {
  id: string;
  code: string;
  hex: string | null;
  name: string;
};

export type AdminVariantCell = {
  id?: string;
  sizeId: string;
  colorId: string;
  sku: string;
  stockQuantity: number;
  isActive: boolean;
};

export type AdminVariantMatrix = {
  sizes: AdminSizeOption[];
  colors: AdminColorOption[];
  cells: AdminVariantCell[];
};

export type VariantCellWrite = {
  sizeId: string;
  colorId: string;
  sku: string;
  stockQuantity: number;
  isActive: boolean;
};
