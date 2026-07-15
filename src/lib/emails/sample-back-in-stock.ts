import { publicEnv } from "@/lib/env";
import type { BackInStockEmailData, BackInStockLocale } from "./back-in-stock-types";

export function buildSampleBackInStockData(
  locale: BackInStockLocale = "en",
): BackInStockEmailData {
  return {
    locale,
    customerEmail: "sara@example.com",
    productName: "Terra Ribbed Shorts",
    productUrl: `${publicEnv.appUrl}/${locale}/shop/terra-ribbed-shorts`,
    variantLabel: "M · Sage",
    imageUrl: null,
  };
}
