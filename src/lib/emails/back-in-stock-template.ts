import { getBackInStockCopy } from "./back-in-stock-copy";
import type {
  BackInStockEmailData,
  RenderedBackInStockEmail,
} from "./back-in-stock-types";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function renderBackInStockEmail(data: BackInStockEmailData): RenderedBackInStockEmail {
  const copy = getBackInStockCopy(data.locale);
  const subject = copy.subject(data.productName);
  const productName = escapeHtml(data.productName);
  const variantLabel = data.variantLabel?.trim()
    ? escapeHtml(data.variantLabel.trim())
    : null;
  const imageUrl = data.imageUrl?.trim() || null;
  const productUrl = escapeHtml(data.productUrl);

  const html = `<!DOCTYPE html>
<html lang="${data.locale}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${escapeHtml(subject)}</title>
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
              <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#4a4a4a;">${escapeHtml(copy.intro(data.productName))}</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;background:#faf9f7;border:1px solid #eceae4;">
                <tr>
                  ${
                    imageUrl
                      ? `<td style="width:96px;padding:16px;vertical-align:top;">
                          <img src="${escapeHtml(imageUrl)}" alt="" width="80" height="100" style="display:block;width:80px;height:100px;object-fit:cover;border:1px solid #e8e6e1;" />
                        </td>`
                      : ""
                  }
                  <td style="padding:16px;font-size:13px;line-height:1.7;color:#4a4a4a;vertical-align:middle;">
                    <p style="margin:0 0 4px;font-size:15px;font-weight:600;color:#121212;">${productName}</p>
                    ${
                      variantLabel
                        ? `<p style="margin:0;font-size:12px;color:#6b6b6b;">${escapeHtml(copy.variantLabel)}: ${variantLabel}</p>`
                        : ""
                    }
                  </td>
                </tr>
              </table>
              <a href="${productUrl}" style="display:inline-block;padding:14px 28px;background:#121212;color:#ffffff;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;">
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

  const textLines = [
    "Mbody",
    copy.title,
    "",
    copy.greeting,
    copy.intro(data.productName),
    "",
    data.productName,
    data.variantLabel?.trim()
      ? `${copy.variantLabel}: ${data.variantLabel.trim()}`
      : null,
    "",
    `${copy.cta}: ${data.productUrl}`,
    "",
    copy.footer,
  ].filter(Boolean);

  return {
    subject,
    html,
    text: textLines.join("\n"),
  };
}
