"use client";

import { AccountDesktopSidebar } from "@/components/account/account-desktop-sidebar";
import { getProfileFirstName } from "@/lib/account/format-profile";
import type { AccountAddress, AccountProfileData } from "@/lib/account/types";

type AccountAddressesPageContentProps = {
  profile: AccountProfileData | null;
};

function formatAddressLines(address: AccountAddress): string[] {
  const lines = [
    address.fullName,
    address.line1,
    address.line2,
    [address.city, address.region, address.postalCode].filter(Boolean).join(", "),
    address.countryCode,
  ].filter((line): line is string => Boolean(line?.trim()));

  if (address.phone) {
    lines.push(address.phone);
  }

  return lines;
}

export function AccountAddressesPageContent({ profile }: AccountAddressesPageContentProps) {
  const displayName = profile?.fullName?.trim() || "Member";
  const firstName = getProfileFirstName(profile?.fullName ?? null) ?? displayName;
  const addresses = profile?.addresses ?? [];

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px]">
      <AccountDesktopSidebar active="addresses" displayName={displayName} email={profile?.email} />

      <main className="flex-grow px-5 py-12 md:ml-64 md:px-16">
        <header className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-5xl font-medium tracking-tight text-primary">Addresses, {firstName}.</h1>
            <p className="mt-2 text-base text-secondary">
              Manage your shipping and billing addresses.
            </p>
          </div>
          <button
            type="button"
            className="rounded bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-on-primary transition-opacity hover:opacity-90"
          >
            + Add Address
          </button>
        </header>

        {addresses.length === 0 ? (
          <section className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-8 text-on-surface-variant">
            No saved addresses yet. Add one to speed up checkout.
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            {addresses.map((address) => (
              <article
                key={address.id}
                className={`relative rounded-xl border p-6 shadow-[0_10px_40px_-10px_rgba(18,18,18,0.05)] ${
                  address.isDefault
                    ? "border-primary bg-surface-container-lowest"
                    : "border-outline-variant/30 bg-surface transition-colors hover:border-primary/30"
                }`}
              >
                {address.isDefault ? (
                  <span className="absolute right-6 top-6 rounded bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-on-primary">
                    Default
                  </span>
                ) : null}
                <h2 className="mb-4 text-base font-semibold tracking-wide text-primary">
                  {address.label?.trim() || "Address"}
                </h2>
                <address className="space-y-1 text-sm not-italic text-secondary">
                  {formatAddressLines(address).map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </address>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
