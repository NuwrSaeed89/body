import { buildSampleNewsletterWelcomeData } from "@/lib/emails/sample-newsletter-welcome";
import { renderNewsletterWelcomeEmail } from "@/lib/emails/send-newsletter-welcome";
import { routing } from "@/i18n/routing";
import { serverEnv } from "@/lib/env";

type PreviewSearchParams = {
  locale?: string;
  format?: string;
};

function parseLocale(value: string | undefined) {
  if (value && routing.locales.includes(value as (typeof routing.locales)[number])) {
    return value as (typeof routing.locales)[number];
  }
  return routing.defaultLocale;
}

/** HTML/text preview for the newsletter welcome template (development only). */
export async function GET(request: Request) {
  if (serverEnv.nodeEnv === "production") {
    return Response.json({ error: "Not available" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries()) as PreviewSearchParams;
  const locale = parseLocale(params.locale);
  const format = params.format ?? "html";

  const data = buildSampleNewsletterWelcomeData(locale);
  const rendered = renderNewsletterWelcomeEmail(data);

  if (format === "json") {
    return Response.json({ locale, subject: rendered.subject, data });
  }

  if (format === "text") {
    return new Response(rendered.text, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return new Response(rendered.html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
