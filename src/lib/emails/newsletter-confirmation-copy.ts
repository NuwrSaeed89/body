import type { NewsletterConfirmationLocale } from "./newsletter-confirmation-types";

type NewsletterConfirmationCopy = {
  subject: string;
  preview: string;
  title: string;
  greeting: string;
  intro: string;
  cta: string;
  footer: string;
  textLink: string;
};

const COPY: Record<NewsletterConfirmationLocale, NewsletterConfirmationCopy> = {
  en: {
    subject: "Confirm your Mbody newsletter subscription",
    preview: "One click to confirm your marketing email consent.",
    title: "Confirm subscription",
    greeting: "Almost there,",
    intro:
      "Please confirm that you want to receive Mbody newsletters and marketing emails. This extra step helps us meet GDPR requirements for marketing consent.",
    cta: "Confirm subscription",
    footer:
      "If you did not request this, you can ignore this email. The link expires in 48 hours.",
    textLink: "Or copy this link into your browser:",
  },
  sv: {
    subject: "Bekräfta din prenumeration på Mbody-nyhetsbrevet",
    preview: "Ett klick för att bekräfta ditt samtycke till marknadsföringsmejl.",
    title: "Bekräfta prenumeration",
    greeting: "Nästan klart,",
    intro:
      "Bekräfta att du vill få nyhetsbrev och marknadsföringsmejl från Mbody. Detta extra steg hjälper oss att uppfylla GDPR-kraven för marknadsföringssamtycke.",
    cta: "Bekräfta prenumeration",
    footer:
      "Om du inte begärde detta kan du ignorera mejlet. Länken går ut om 48 timmar.",
    textLink: "Eller kopiera denna länk till din webbläsare:",
  },
  es: {
    subject: "Confirma tu suscripción al newsletter de Mbody",
    preview: "Un clic para confirmar tu consentimiento de marketing.",
    title: "Confirmar suscripción",
    greeting: "Casi listo,",
    intro:
      "Confirma que deseas recibir newsletters y correos de marketing de Mbody. Este paso adicional nos ayuda a cumplir con el RGPD para el consentimiento de marketing.",
    cta: "Confirmar suscripción",
    footer:
      "Si no solicitaste esto, puedes ignorar este correo. El enlace caduca en 48 horas.",
    textLink: "O copia este enlace en tu navegador:",
  },
  de: {
    subject: "Bestätige dein Mbody-Newsletter-Abonnement",
    preview: "Ein Klick zur Bestätigung deiner Marketing-Einwilligung.",
    title: "Abonnement bestätigen",
    greeting: "Fast geschafft,",
    intro:
      "Bitte bestätige, dass du Mbody-Newsletter und Marketing-E-Mails erhalten möchtest. Dieser zusätzliche Schritt hilft uns, die DSGVO-Anforderungen für Marketing-Einwilligungen zu erfüllen.",
    cta: "Abonnement bestätigen",
    footer:
      "Wenn du dies nicht angefordert hast, kannst du diese E-Mail ignorieren. Der Link läuft in 48 Stunden ab.",
    textLink: "Oder kopiere diesen Link in deinen Browser:",
  },
};

export function getNewsletterConfirmationCopy(locale: string): NewsletterConfirmationCopy {
  if (locale in COPY) {
    return COPY[locale as NewsletterConfirmationLocale];
  }
  return COPY.en;
}
