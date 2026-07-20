import type {
  OrderConfirmationLocale,
  OrderPaymentMethod,
} from "./order-confirmation-types";

type OrderConfirmationCopy = {
  subject: (orderNumber: string) => string;
  preview: string;
  title: string;
  greeting: (name: string) => string;
  intro: string;
  orderNumberLabel: string;
  orderDateLabel: string;
  paymentMethodLabel: string;
  shippingMethodLabel: string;
  shippingAddressLabel: string;
  itemsTitle: string;
  sizeLabel: string;
  colorLabel: string;
  qtyLabel: string;
  subtotalLabel: string;
  shippingLabel: string;
  vatLabel: string;
  totalLabel: string;
  cta: string;
  footer: string;
  paymentMethods: Record<OrderPaymentMethod, string>;
};

const COPY: Record<OrderConfirmationLocale, OrderConfirmationCopy> = {
  en: {
    subject: (n) => `Your Mbody order ${n} is confirmed`,
    preview: "Thank you for your order — we're preparing your pieces.",
    title: "Order confirmed",
    greeting: (name) => `Hi ${name},`,
    intro:
      "Thank you for shopping with Mbody. Your payment was successful and we're preparing your order for shipment within the EU.",
    orderNumberLabel: "Order number",
    orderDateLabel: "Order date",
    paymentMethodLabel: "Payment",
    shippingMethodLabel: "Delivery",
    shippingAddressLabel: "Shipping to",
    itemsTitle: "Your items",
    sizeLabel: "Size",
    colorLabel: "Color",
    qtyLabel: "Qty",
    subtotalLabel: "Subtotal",
    shippingLabel: "Shipping",
    vatLabel: "VAT included",
    totalLabel: "Total paid",
    cta: "View order in your account",
    footer: "Questions? Reply to this email or contact support@mbody.com",
    paymentMethods: {
      card: "Card",
      klarna: "Klarna",
      apple_pay: "Apple Pay",
      google_pay: "Google Pay",
      cod: "Cash on delivery",
    },
  },
  sv: {
    subject: (n) => `Din Mbody-order ${n} är bekräftad`,
    preview: "Tack för din beställning — vi förbereder dina plagg.",
    title: "Order bekräftad",
    greeting: (name) => `Hej ${name},`,
    intro:
      "Tack för att du handlar hos Mbody. Din betalning lyckades och vi förbereder din order för leverans inom EU.",
    orderNumberLabel: "Ordernummer",
    orderDateLabel: "Orderdatum",
    paymentMethodLabel: "Betalning",
    shippingMethodLabel: "Leverans",
    shippingAddressLabel: "Leverans till",
    itemsTitle: "Dina artiklar",
    sizeLabel: "Storlek",
    colorLabel: "Färg",
    qtyLabel: "Antal",
    subtotalLabel: "Delsumma",
    shippingLabel: "Frakt",
    vatLabel: "Moms ingår",
    totalLabel: "Totalt betalt",
    cta: "Visa order i ditt konto",
    footer: "Frågor? Svara på detta mejl eller kontakta support@mbody.com",
    paymentMethods: {
      card: "Kort",
      klarna: "Klarna",
      apple_pay: "Apple Pay",
      google_pay: "Google Pay",
      cod: "Postförskott",
    },
  },
  es: {
    subject: (n) => `Tu pedido Mbody ${n} está confirmado`,
    preview: "Gracias por tu pedido — estamos preparando tus piezas.",
    title: "Pedido confirmado",
    greeting: (name) => `Hola ${name},`,
    intro:
      "Gracias por comprar en Mbody. Tu pago se ha completado y estamos preparando tu pedido para el envío dentro de la UE.",
    orderNumberLabel: "Número de pedido",
    orderDateLabel: "Fecha del pedido",
    paymentMethodLabel: "Pago",
    shippingMethodLabel: "Entrega",
    shippingAddressLabel: "Envío a",
    itemsTitle: "Tus artículos",
    sizeLabel: "Talla",
    colorLabel: "Color",
    qtyLabel: "Cant.",
    subtotalLabel: "Subtotal",
    shippingLabel: "Envío",
    vatLabel: "IVA incluido",
    totalLabel: "Total pagado",
    cta: "Ver pedido en tu cuenta",
    footer: "¿Preguntas? Responde a este correo o escribe a support@mbody.com",
    paymentMethods: {
      card: "Tarjeta",
      klarna: "Klarna",
      apple_pay: "Apple Pay",
      google_pay: "Google Pay",
      cod: "Contra reembolso",
    },
  },
  de: {
    subject: (n) => `Deine Mbody-Bestellung ${n} ist bestätigt`,
    preview: "Danke für deine Bestellung — wir bereiten deine Artikel vor.",
    title: "Bestellung bestätigt",
    greeting: (name) => `Hallo ${name},`,
    intro:
      "Danke für deinen Einkauf bei Mbody. Deine Zahlung war erfolgreich und wir bereiten deine Bestellung für den Versand in der EU vor.",
    orderNumberLabel: "Bestellnummer",
    orderDateLabel: "Bestelldatum",
    paymentMethodLabel: "Zahlung",
    shippingMethodLabel: "Lieferung",
    shippingAddressLabel: "Lieferung an",
    itemsTitle: "Deine Artikel",
    sizeLabel: "Größe",
    colorLabel: "Farbe",
    qtyLabel: "Menge",
    subtotalLabel: "Zwischensumme",
    shippingLabel: "Versand",
    vatLabel: "MwSt. enthalten",
    totalLabel: "Gesamt bezahlt",
    cta: "Bestellung im Konto ansehen",
    footer: "Fragen? Antworte auf diese E-Mail oder kontaktiere support@mbody.com",
    paymentMethods: {
      card: "Karte",
      klarna: "Klarna",
      apple_pay: "Apple Pay",
      google_pay: "Google Pay",
      cod: "Nachnahme",
    },
  },
};

const COD_OVERRIDES: Record<
  OrderConfirmationLocale,
  Pick<OrderConfirmationCopy, "subject" | "preview" | "title" | "intro" | "totalLabel">
> = {
  en: {
    subject: (n) => `Your Mbody COD order ${n} is confirmed`,
    preview: "Cash on delivery — pay when your order arrives.",
    title: "COD order confirmed",
    intro:
      "Thank you for shopping with Mbody. Your cash-on-delivery order is confirmed. Please have the exact amount ready when your package is delivered within the EU. No card payment was taken online.",
    totalLabel: "Total due on delivery",
  },
  sv: {
    subject: (n) => `Din Mbody postförskottsorder ${n} är bekräftad`,
    preview: "Postförskott — betala vid leverans.",
    title: "Postförskottsorder bekräftad",
    intro:
      "Tack för att du handlar hos Mbody. Din postförskottsorder är bekräftad. Ha beloppet redo vid leverans inom EU. Ingen kortbetalning har dragits online.",
    totalLabel: "Totalt att betala vid leverans",
  },
  es: {
    subject: (n) => `Tu pedido COD Mbody ${n} está confirmado`,
    preview: "Contra reembolso — paga al recibir el pedido.",
    title: "Pedido COD confirmado",
    intro:
      "Gracias por comprar en Mbody. Tu pedido contra reembolso está confirmado. Ten el importe listo al recibir el paquete en la UE. No se ha cobrado ninguna tarjeta online.",
    totalLabel: "Total a pagar a la entrega",
  },
  de: {
    subject: (n) => `Deine Mbody-Nachnahmebestellung ${n} ist bestätigt`,
    preview: "Nachnahme — Zahlung bei Lieferung.",
    title: "Nachnahmebestellung bestätigt",
    intro:
      "Danke für deinen Einkauf bei Mbody. Deine Nachnahmebestellung ist bestätigt. Bitte halte den Betrag bei der Lieferung in der EU bereit. Es wurde online keine Kartenzahlung eingezogen.",
    totalLabel: "Gesamtbetrag bei Lieferung",
  },
};

export function getOrderConfirmationCopy(
  locale: OrderConfirmationLocale,
  paymentMethod?: OrderPaymentMethod,
) {
  const base = COPY[locale] ?? COPY.en;
  if (paymentMethod !== "cod") return base;

  const cod = COD_OVERRIDES[locale] ?? COD_OVERRIDES.en;
  return {
    ...base,
    ...cod,
  };
}
