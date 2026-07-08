"use client";

import Image from "next/image";
import { useFormatter, useTranslations } from "next-intl";
import { FormattedPrice } from "@/components/ui/formatted-price";
import type { AccountOrder } from "@/lib/account-data";

type AccountOrderCardProps = {
  order: AccountOrder;
  variant?: "mobile" | "desktop";
};

export function AccountOrderCard({ order, variant = "mobile" }: AccountOrderCardProps) {
  const t = useTranslations("account.orders");
  const format = useFormatter();
  const isDelivered = order.status === "delivered";
  const formattedDate = format.dateTime(new Date(order.date), {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article
      className={`flex flex-col gap-5 rounded-lg border border-outline-variant/10 bg-surface-container-lowest p-5 shadow-[0_20px_50px_rgba(18,18,18,0.03)] ${
        isDelivered ? "opacity-90 hover:opacity-100" : ""
      } ${variant === "desktop" ? "md:flex-row md:items-center md:gap-8 md:p-8" : ""}`}
    >
      <div
        className={`relative shrink-0 overflow-hidden rounded bg-surface-container-high ${
          variant === "desktop"
            ? "aspect-[4/5] w-full md:w-32"
            : "aspect-[4/5] w-full max-w-[140px]"
        }`}
      >
        <Image
          src={order.image}
          alt={order.imageAlt}
          fill
          className="object-cover"
          sizes="140px"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-secondary">
              {t("orderNumber", { id: order.id })}
            </p>
            <h3 className="text-base font-semibold tracking-wide text-primary">{order.title}</h3>
          </div>
          <span
            className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${
              isDelivered
                ? "bg-secondary-container text-on-secondary-container"
                : "bg-surface-container-high text-primary"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isDelivered
                  ? "bg-on-secondary-container"
                  : "animate-pulse bg-surface-tint"
              }`}
              aria-hidden
            />
            {t(`status.${order.status}`)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 border-y border-outline-variant/20 py-4 sm:grid-cols-4">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-on-tertiary-container">
              {t("date")}
            </p>
            <p className="text-sm text-primary">{formattedDate}</p>
          </div>
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-on-tertiary-container">
              {t("items")}
            </p>
            <p className="text-sm text-primary">
              {t("itemCount", { count: order.itemCount })}
            </p>
          </div>
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-on-tertiary-container">
              {t("total")}
            </p>
            <p className="text-sm text-primary">
              <FormattedPrice amountSek={order.totalSek} />
            </p>
          </div>
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-on-tertiary-container">
              {isDelivered ? t("statusLabel") : t("estDelivery")}
            </p>
            <p className="text-sm text-primary">
              {isDelivered ? t(`status.${order.status}`) : order.estDelivery}
            </p>
          </div>
        </div>
      </div>

      <div className={`flex flex-col gap-3 ${variant === "desktop" ? "w-full md:w-auto" : ""}`}>
        {isDelivered ? (
          <>
            <button
              type="button"
              className="rounded border border-outline px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] transition-colors hover:bg-surface-container-low"
            >
              {t("buyAgain")}
            </button>
            <button
              type="button"
              className="rounded border border-outline px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] transition-colors hover:bg-surface-container-low"
            >
              {t("returnItem")}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="rounded bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-on-primary transition-opacity hover:opacity-90"
            >
              {t("trackOrder")}
            </button>
            <button
              type="button"
              className="rounded border border-outline px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] transition-colors hover:bg-surface-container-low"
            >
              {t("details")}
            </button>
          </>
        )}
      </div>
    </article>
  );
}
