"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AccountDesktopSidebar } from "@/components/account/account-desktop-sidebar";
import { AuthUnderlineField } from "@/components/auth/auth-underline-field";
import { getProfileFirstName } from "@/lib/account/format-profile";
import type { AccountProfileData } from "@/lib/account/types";

type AccountSettingsPageContentProps = {
  profile: AccountProfileData | null;
};

function splitFullName(fullName: string | null): { firstName: string; lastName: string } {
  const trimmed = fullName?.trim() ?? "";
  if (!trimmed) return { firstName: "", lastName: "" };

  const parts = trimmed.split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

export function AccountSettingsPageContent({ profile }: AccountSettingsPageContentProps) {
  const t = useTranslations("account");
  const displayName = profile?.fullName?.trim() || "Member";
  const firstName = getProfileFirstName(profile?.fullName ?? null) ?? displayName;
  const initialNames = splitFullName(profile?.fullName ?? null);

  const [firstNameField, setFirstNameField] = useState(initialNames.firstName);
  const [lastNameField, setLastNameField] = useState(initialNames.lastName);
  const [email, setEmail] = useState(profile?.email ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px]">
      <AccountDesktopSidebar active="settings" displayName={displayName} email={profile?.email} />

      <main className="flex-grow px-5 py-12 md:ml-64 md:px-16">
        <header className="mb-12">
          <h1 className="text-5xl font-medium tracking-tight text-primary">Settings, {firstName}.</h1>
          <p className="mt-2 text-base text-secondary">
            Update your personal information and account preferences.
          </p>
        </header>

        <section aria-labelledby="account-settings-profile" className="max-w-3xl space-y-10">
          <div>
            <h2
              id="account-settings-profile"
              className="mb-6 text-xl font-medium text-primary md:text-2xl"
            >
              {t("profile.personalInfo")}
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
              <AuthUnderlineField
                id="settings-first-name"
                label={t("login.firstName")}
                value={firstNameField}
                onChange={(event) => setFirstNameField(event.target.value)}
                autoComplete="given-name"
              />
              <AuthUnderlineField
                id="settings-last-name"
                label={t("login.lastName")}
                value={lastNameField}
                onChange={(event) => setLastNameField(event.target.value)}
                autoComplete="family-name"
              />
              <div className="md:col-span-2">
                <AuthUnderlineField
                  id="settings-email"
                  label={t("login.email")}
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                />
              </div>
              <div className="md:col-span-2">
                <AuthUnderlineField
                  id="settings-phone"
                  label="Phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  autoComplete="tel"
                />
              </div>
            </div>
            <button
              type="button"
              className="mt-8 rounded bg-primary px-10 py-4 text-xs font-semibold uppercase tracking-[0.1em] text-on-primary transition-opacity hover:opacity-90"
            >
              {t("profile.saveChanges")}
            </button>
          </div>

          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6">
            <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-secondary">
              Preferences
            </h3>
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
                  Locale
                </dt>
                <dd className="mt-1 text-sm text-primary">{profile?.locale ?? "en"}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
                  Currency
                </dt>
                <dd className="mt-1 text-sm text-primary">{profile?.currency ?? "EUR"}</dd>
              </div>
            </dl>
          </div>
        </section>
      </main>
    </div>
  );
}
