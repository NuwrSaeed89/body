import type { NewsletterWelcomeLocale } from "./newsletter-welcome-types";

type NewsletterWelcomeCopy = {
  subject: string;
  preview: string;
  title: string;
  greeting: string;
  intro: string;
  perksTitle: string;
  perks: string[];
  cta: string;
  footer: string;
};

const COPY: Record<NewsletterWelcomeLocale, NewsletterWelcomeCopy> = {
  en: {
    subject: "Welcome to Mbody — you're on the list",
    preview: "Early access to drops, performance wear, and member-only updates.",
    title: "Newsletter",
    greeting: "Welcome to the movement,",
    intro:
      "Thanks for joining the Mbody newsletter. You'll be first to hear about new drops, restocks, and performance insights curated for our community.",
    perksTitle: "What to expect",
    perks: [
      "Early access to limited releases",
      "Restock alerts for sold-out favorites",
      "Training and product stories from the Mbody team",
    ],
    cta: "Explore the shop",
    footer: "You received this because you subscribed on mbody.com. We only email with your consent.",
  },
  sv: {
    subject: "Välkommen till Mbody — du är med på listan",
    preview: "Tidig tillgång till släpp, performance wear och medlemsuppdateringar.",
    title: "Nyhetsbrev",
    greeting: "Välkommen till rörelsen,",
    intro:
      "Tack för att du prenumererar på Mbody-nyhetsbrevet. Du får veta först om nya släpp, åter i lager och insikter för vår community.",
    perksTitle: "Det här kan du förvänta dig",
    perks: [
      "Tidig tillgång till begränsade släpp",
      "Åter i lager för utsålda favoriter",
      "Tränings- och produktberättelser från Mbody-teamet",
    ],
    cta: "Utforska butiken",
    footer: "Du får detta för att du prenumererade på mbody.com. Vi mejlar bara med ditt samtycke.",
  },
  es: {
    subject: "Bienvenida a Mbody — ya estás en la lista",
    preview: "Acceso anticipado a lanzamientos, performance wear y novedades exclusivas.",
    title: "Newsletter",
    greeting: "Bienvenida al movimiento,",
    intro:
      "Gracias por unirte al newsletter de Mbody. Serás la primera en enterarte de nuevos lanzamientos, reposiciones e historias de rendimiento para nuestra comunidad.",
    perksTitle: "Qué puedes esperar",
    perks: [
      "Acceso anticipado a ediciones limitadas",
      "Avisos cuando vuelvan tus favoritos agotados",
      "Historias de entrenamiento y producto del equipo Mbody",
    ],
    cta: "Explorar la tienda",
    footer: "Recibes esto porque te suscribiste en mbody.com. Solo enviamos correos con tu consentimiento.",
  },
  de: {
    subject: "Willkommen bei Mbody — du bist auf der Liste",
    preview: "Früher Zugang zu Drops, Performance Wear und exklusiven Updates.",
    title: "Newsletter",
    greeting: "Willkommen in der Bewegung,",
    intro:
      "Danke für deine Anmeldung zum Mbody-Newsletter. Du erfährst als Erste von neuen Drops, Nachlieferungen und Performance-Insights für unsere Community.",
    perksTitle: "Das erwartet dich",
    perks: [
      "Früher Zugang zu limitierten Releases",
      "Hinweise, wenn Favoriten wieder verfügbar sind",
      "Training- und Produktgeschichten vom Mbody-Team",
    ],
    cta: "Shop entdecken",
    footer: "Du erhältst dies, weil du dich auf mbody.com angemeldet hast. Wir mailen nur mit deiner Einwilligung.",
  },
};

export function getNewsletterWelcomeCopy(locale: NewsletterWelcomeLocale): NewsletterWelcomeCopy {
  return COPY[locale] ?? COPY.en;
}
