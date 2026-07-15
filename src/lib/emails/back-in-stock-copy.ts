import type { BackInStockLocale } from "./back-in-stock-types";

type BackInStockCopy = {
  subject: (productName: string) => string;
  preview: string;
  title: string;
  greeting: string;
  intro: (productName: string) => string;
  variantLabel: string;
  cta: string;
  footer: string;
};

const COPY: Record<BackInStockLocale, BackInStockCopy> = {
  en: {
    subject: (name) => `${name} is back in stock at Mbody`,
    preview: "The piece you were waiting for is available again.",
    title: "Back in stock",
    greeting: "Good news,",
    intro: (name) =>
      `${name} is available again. Stock can move quickly — grab yours while sizes last.`,
    variantLabel: "Requested option",
    cta: "Shop now",
    footer: "You received this because you asked to be notified when this product returned.",
  },
  sv: {
    subject: (name) => `${name} finns i lager igen hos Mbody`,
    preview: "Plagget du väntade på finns tillgängligt igen.",
    title: "Tillbaka i lager",
    greeting: "Goda nyheter,",
    intro: (name) =>
      `${name} finns tillgänglig igen. Lagret kan ta slut snabbt — säkra din storlek nu.`,
    variantLabel: "Önskat alternativ",
    cta: "Handla nu",
    footer: "Du får detta för att du bad om avisering när produkten kom tillbaka.",
  },
  es: {
    subject: (name) => `${name} vuelve a estar disponible en Mbody`,
    preview: "La prenda que esperabas ya está disponible de nuevo.",
    title: "De nuevo en stock",
    greeting: "Buenas noticias,",
    intro: (name) =>
      `${name} vuelve a estar disponible. El stock puede agotarse rápido — consigue tu talla.`,
    variantLabel: "Opción solicitada",
    cta: "Comprar ahora",
    footer: "Recibes esto porque pediste aviso cuando este producto volviera.",
  },
  de: {
    subject: (name) => `${name} ist bei Mbody wieder verfügbar`,
    preview: "Das Teil, auf das du gewartet hast, ist wieder verfügbar.",
    title: "Wieder auf Lager",
    greeting: "Gute Neuigkeiten,",
    intro: (name) =>
      `${name} ist wieder verfügbar. Der Bestand kann schnell weg sein — sichere dir deine Größe.`,
    variantLabel: "Gewünschte Option",
    cta: "Jetzt shoppen",
    footer: "Du erhältst dies, weil du benachrichtigt werden wolltest, sobald das Produkt zurück ist.",
  },
};

export function getBackInStockCopy(locale: BackInStockLocale): BackInStockCopy {
  return COPY[locale] ?? COPY.en;
}
