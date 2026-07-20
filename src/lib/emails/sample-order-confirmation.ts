import { formatPriceFromSek, extractVatFromInclusive, calculateCartSummary } from "@/lib/currency";
import { publicEnv } from "@/lib/env";
import type { OrderConfirmationEmailData, OrderConfirmationLocale } from "./order-confirmation-types";

export function buildSampleOrderConfirmationData(
  locale: OrderConfirmationLocale = "en",
  paymentMethod: OrderConfirmationEmailData["paymentMethod"] = "card",
): OrderConfirmationEmailData {
  const subtotalSek = 1740;
  const summary = calculateCartSummary(subtotalSek, "EUR", locale);
  const vatSek = extractVatFromInclusive(subtotalSek);

  return {
    locale,
    orderNumber: "MB-1048",
    orderDate: new Intl.DateTimeFormat(locale, {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date()),
    customerEmail: "jane.doe@example.com",
    customerName: "Jane Doe",
    paymentMethod,
    shippingMethod:
      paymentMethod === "cod"
        ? "Standard Shipping · Pay on delivery"
        : "Standard Shipping · 3–5 business days",
    shippingAddress: {
      name: "Jane Doe",
      line1: "Södermalmstorg 4",
      city: "Stockholm",
      postalCode: "118 64",
      country: "Sweden",
    },
    items: [
      {
        name: "Sculpt High-Rise Leggings",
        size: "S",
        color: "Charcoal Black",
        quantity: 1,
        lineTotalFormatted: formatPriceFromSek(990, "EUR", locale),
      },
      {
        name: "Elite Support Bra",
        size: "M",
        color: "Basalt Grey",
        quantity: 1,
        lineTotalFormatted: formatPriceFromSek(750, "EUR", locale),
      },
    ],
    subtotalFormatted: summary.subtotal,
    shippingFormatted: summary.freeShipping ? "Free" : summary.shipping,
    vatFormatted: formatPriceFromSek(vatSek, "EUR", locale),
    totalFormatted: summary.grandTotal,
    accountOrderUrl: `${publicEnv.appUrl}/${locale}/account`,
  };
}
