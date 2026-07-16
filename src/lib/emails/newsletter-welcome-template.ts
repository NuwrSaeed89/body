import { getNewsletterWelcomeCopy } from "./newsletter-welcome-copy";
import type {
  NewsletterWelcomeEmailData,
  RenderedNewsletterWelcomeEmail,
} from "./newsletter-welcome-types";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function renderNewsletterWelcomeEmail(
  data: NewsletterWelcomeEmailData,
): RenderedNewsletterWelcomeEmail {
  const copy = getNewsletterWelcomeCopy(data.locale);
  const shopUrl = escapeHtml(data.shopUrl);

  const perksHtml = copy.perks
    .map(
      (perk) =>
        `<li style="margin:0 0 8px;font-size:14px;line-height:1.5;color:#4a4a4a;">${escapeHtml(perk)}</li>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="${data.locale}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${escapeHtml(copy.subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f5f3ee;font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;color:#121212;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(copy.preview)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f3ee;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e8e6e1;">
          <tr>
            <td style="padding:32px 32px 24px;border-bottom:1px solid #e8e6e1;">
              <p style="margin:0 0 24px;font-size:20px;font-weight:700;letter-spacing:-0.02em;color:#121212;">Mbody</p>
              <p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#8a7a4a;">${escapeHtml(copy.title)}</p>
              <h1 style="margin:0;font-size:24px;font-weight:500;line-height:1.3;color:#121212;">${escapeHtml(copy.greeting)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;">
              <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#4a4a4a;">${escapeHtml(copy.intro)}</p>
              <p style="margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#8a7a4a;">${escapeHtml(copy.perksTitle)}</p>
              <ul style="margin:0 0 24px;padding-left:20px;">${perksHtml}</ul>
              <a href="${shopUrl}" style="display:inline-block;padding:14px 28px;background:#121212;color:#ffffff;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;">
                ${escapeHtml(copy.cta)}
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 32px;border-top:1px solid #e8e6e1;">
              <p style="margin:0;font-size:11px;line-height:1.6;color:#8a8a8a;">${escapeHtml(copy.footer)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    "Mbody",
    copy.title,
    "",
    copy.greeting,
    copy.intro,
    "",
    copy.perksTitle,
    ...copy.perks.map((perk) => `• ${perk}`),
    "",
    `${copy.cta}: ${data.shopUrl}`,
    "",
    copy.footer,
  ].join("\n");

  return { subject: copy.subject, html, text };
}
