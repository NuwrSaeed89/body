import type { Locale } from "@/i18n/routing";

export type BackInStockLocale = Locale;

export type BackInStockEmailData = {
  locale: BackInStockLocale;
  customerEmail: string;
  productName: string;
  productUrl: string;
  variantLabel?: string | null;
  imageUrl?: string | null;
};

export type RenderedBackInStockEmail = {
  subject: string;
  html: string;
  text: string;
};

export type SendBackInStockResult = {
  ok: boolean;
  mode: "resend" | "log";
  messageId?: string;
  error?: string;
};
