import { getOrderConfirmationCopy } from "./order-confirmation-copy";
import type {
  OrderConfirmationEmailData,
  RenderedOrderConfirmationEmail,
} from "./order-confirmation-types";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderItemsHtml(data: OrderConfirmationEmailData, copy: ReturnType<typeof getOrderConfirmationCopy>) {
  return data.items
    .map((item) => {
      const meta = [
        `${copy.sizeLabel}: ${escapeHtml(item.size)}`,
        item.color ? `${copy.colorLabel}: ${escapeHtml(item.color)}` : null,
        `${copy.qtyLabel}: ${item.quantity}`,
      ]
        .filter(Boolean)
        .join(" · ");

      return `
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid #e8e6e1;">
            <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#121212;">${escapeHtml(item.name)}</p>
            <p style="margin:0;font-size:12px;color:#6b6b6b;">${meta}</p>
          </td>
          <td align="right" style="padding:16px 0;border-bottom:1px solid #e8e6e1;font-size:14px;font-weight:600;color:#121212;white-space:nowrap;">
            ${escapeHtml(item.lineTotalFormatted)}
          </td>
        </tr>`;
    })
    .join("");
}

function renderAddress(data: OrderConfirmationEmailData) {
  const { shippingAddress: a } = data;
  const lines = [a.line1, a.line2, `${a.postalCode} ${a.city}`, a.country].filter(
    (line): line is string => Boolean(line),
  );
  return lines.map((line) => escapeHtml(line)).join("<br />");
}

export function renderOrderConfirmationEmail(
  data: OrderConfirmationEmailData,
): RenderedOrderConfirmationEmail {
  const copy = getOrderConfirmationCopy(data.locale, data.paymentMethod);
  const paymentLabel = copy.paymentMethods[data.paymentMethod];

  const html = `<!DOCTYPE html>
<html lang="${data.locale}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${escapeHtml(copy.subject(data.orderNumber))}</title>
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
              <h1 style="margin:0;font-size:24px;font-weight:500;line-height:1.3;color:#121212;">${escapeHtml(copy.greeting(data.customerName))}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;">
              <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#4a4a4a;">${escapeHtml(copy.intro)}</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;background:#faf9f7;border:1px solid #eceae4;">
                <tr>
                  <td style="padding:16px;font-size:13px;line-height:1.7;color:#4a4a4a;">
                    <strong style="color:#121212;">${escapeHtml(copy.orderNumberLabel)}:</strong> ${escapeHtml(data.orderNumber)}<br />
                    <strong style="color:#121212;">${escapeHtml(copy.orderDateLabel)}:</strong> ${escapeHtml(data.orderDate)}<br />
                    <strong style="color:#121212;">${escapeHtml(copy.paymentMethodLabel)}:</strong> ${escapeHtml(paymentLabel)}<br />
                    <strong style="color:#121212;">${escapeHtml(copy.shippingMethodLabel)}:</strong> ${escapeHtml(data.shippingMethod)}
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#121212;">${escapeHtml(copy.shippingAddressLabel)}</p>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#4a4a4a;">
                <strong>${escapeHtml(data.shippingAddress.name)}</strong><br />
                ${renderAddress(data)}
              </p>
              <p style="margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#121212;">${escapeHtml(copy.itemsTitle)}</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
                ${renderItemsHtml(data, copy)}
              </table>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#6b6b6b;">${escapeHtml(copy.subtotalLabel)}</td>
                  <td align="right" style="padding:6px 0;font-size:13px;color:#121212;">${escapeHtml(data.subtotalFormatted)}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#6b6b6b;">${escapeHtml(copy.shippingLabel)}</td>
                  <td align="right" style="padding:6px 0;font-size:13px;color:#121212;">${escapeHtml(data.shippingFormatted)}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#6b6b6b;">${escapeHtml(copy.vatLabel)}</td>
                  <td align="right" style="padding:6px 0;font-size:13px;color:#121212;">${escapeHtml(data.vatFormatted)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0 0;border-top:1px solid #e8e6e1;font-size:14px;font-weight:600;color:#121212;">${escapeHtml(copy.totalLabel)}</td>
                  <td align="right" style="padding:12px 0 0;border-top:1px solid #e8e6e1;font-size:14px;font-weight:600;color:#121212;">${escapeHtml(data.totalFormatted)}</td>
                </tr>
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background:#121212;border-radius:2px;">
                    <a href="${escapeHtml(data.accountOrderUrl)}" style="display:inline-block;padding:14px 28px;font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;text-decoration:none;color:#ffffff;">${escapeHtml(copy.cta)}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;border-top:1px solid #e8e6e1;font-size:11px;line-height:1.6;color:#8a8a8a;">
              ${escapeHtml(copy.footer)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const itemLines = data.items
    .map(
      (item) =>
        `- ${item.name} (${copy.sizeLabel} ${item.size}${item.color ? `, ${copy.colorLabel} ${item.color}` : ""}, ${copy.qtyLabel} ${item.quantity}) — ${item.lineTotalFormatted}`,
    )
    .join("\n");

  const text = `${copy.greeting(data.customerName)}

${copy.intro}

${copy.orderNumberLabel}: ${data.orderNumber}
${copy.orderDateLabel}: ${data.orderDate}
${copy.paymentMethodLabel}: ${paymentLabel}
${copy.shippingMethodLabel}: ${data.shippingMethod}

${copy.shippingAddressLabel}:
${data.shippingAddress.name}
${data.shippingAddress.line1}
${data.shippingAddress.line2 ?? ""}
${data.shippingAddress.postalCode} ${data.shippingAddress.city}
${data.shippingAddress.country}

${copy.itemsTitle}:
${itemLines}

${copy.subtotalLabel}: ${data.subtotalFormatted}
${copy.shippingLabel}: ${data.shippingFormatted}
${copy.vatLabel}: ${data.vatFormatted}
${copy.totalLabel}: ${data.totalFormatted}

${copy.cta}: ${data.accountOrderUrl}

${copy.footer}`;

  return {
    subject: copy.subject(data.orderNumber),
    html,
    text,
  };
}
