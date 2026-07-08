import type { ColorLocale } from "./constants";

export type ColorWriteInput = {
  hex: string;
  name: string;
  code?: string;
  translations?: { locale: ColorLocale; name: string }[];
};

export type AdminColorDetail = {
  id: string;
  code: string;
  hex: string;
  name: string;
  sortOrder: number;
};
