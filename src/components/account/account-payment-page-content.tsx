"use client";

import { AccountDesktopSidebar } from "@/components/account/account-desktop-sidebar";
import { getProfileFirstName } from "@/lib/account/format-profile";
import type { AccountPaymentRecord, AccountProfileData } from "@/lib/account/types";

type AccountPaymentPageContentProps = {
  profile: AccountProfileData | null;
  payments: AccountPaymentRecord[];
};

const METHOD_LABELS: Record<string, string> = {
  card: "Card",
  apple_pay: "Apple Pay",
  google_pay: "Google Pay",
  klarna: "Klarna",
  cod: "Cash on Delivery",
};

function formatMoney(amount: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatPaymentDate(date: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function getMethodLabel(method: string): string {
  return METHOD_LABELS[method] ?? method.replaceAll("_", " ");
}

export function AccountPaymentPageContent({ profile, payments }: AccountPaymentPageContentProps) {
  const displayName = profile?.fullName?.trim() || "Member";
  const firstName = getProfileFirstName(profile?.fullName ?? null) ?? displayName;
  const locale = profile?.locale ?? "en";
  const defaultCurrency = profile?.currency ?? "EUR";

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px]">
      <AccountDesktopSidebar active="payment" displayName={displayName} email={profile?.email} />

      <main className="flex-grow px-5 py-12 md:ml-64 md:px-16">
        <header className="mb-12">
          <h1 className="text-5xl font-medium tracking-tight text-primary">Payment, {firstName}.</h1>
          <p className="mt-2 text-base text-secondary">
            Review payment methods used for your orders.
          </p>
        </header>

        <section className="mb-10 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-secondary">
                Saved Methods
              </p>
              <p className="mt-1 text-sm text-on-surface-variant">
                Card details are handled securely at checkout. No cards are stored on file.
              </p>
            </div>
            <button
              type="button"
              className="rounded border border-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-primary transition-colors hover:bg-surface-container"
            >
              Add Payment Method
            </button>
          </div>
        </section>

        {payments.length === 0 ? (
          <section className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-8 text-on-surface-variant">
            No payment history yet. Your first order will appear here.
          </section>
        ) : (
          <section className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-secondary">
              Recent Payments
            </h2>
            {payments.map((payment) => (
              <article
                key={payment.id}
                className="flex flex-col gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-[0_10px_40px_-10px_rgba(18,18,18,0.05)] md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-lg font-semibold text-primary">{getMethodLabel(payment.method)}</p>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Order #{payment.orderNumber} · {formatPaymentDate(payment.createdAt, locale)}
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-lg font-semibold text-primary">
                    {formatMoney(payment.amount, payment.currency ?? defaultCurrency, locale)}
                  </p>
                  <p className="text-xs uppercase tracking-[0.1em] text-on-surface-variant">
                    {payment.status.replaceAll("_", " ")}
                  </p>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
