import { getTranslations } from "next-intl/server";

export async function OrderSummary() {
  const t = await getTranslations("checkout.summary");

  const items = [
    { name: "Sculpt High-Rise Leggings", size: "S", qty: 1, price: "€89" },
    { name: "Elite Support Bra", size: "M", qty: 1, price: "€68" },
  ];

  return (
    <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-6">
      <h2 className="mb-6 text-sm font-semibold uppercase tracking-[0.1em] text-primary">
        {t("title")}
      </h2>

      <ul className="mb-6 space-y-4 border-b border-outline-variant/20 pb-6">
        {items.map((item) => (
          <li key={item.name} className="flex justify-between gap-4 text-sm">
            <div>
              <p className="font-medium text-on-surface">{item.name}</p>
              <p className="text-secondary">
                {t("size")}: {item.size} · {t("qty")}: {item.qty}
              </p>
            </div>
            <span className="shrink-0 text-on-surface">{item.price}</span>
          </li>
        ))}
      </ul>

      <dl className="space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-secondary">{t("subtotal")}</dt>
          <dd>€157</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-secondary">{t("shipping")}</dt>
          <dd>{t("free")}</dd>
        </div>
        <div className="flex justify-between border-t border-outline-variant/20 pt-3 text-base font-medium">
          <dt>{t("total")}</dt>
          <dd>€157</dd>
        </div>
      </dl>
    </div>
  );
}
