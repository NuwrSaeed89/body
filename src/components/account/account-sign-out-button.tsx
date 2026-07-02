"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/providers/auth-provider";

export function AccountSignOutButton() {
  const t = useTranslations("account");
  const router = useRouter();
  const { signOut } = useAuth();

  return (
    <button
      type="button"
      onClick={() => {
        void signOut().then(() => router.push("/account/login"));
      }}
      className="text-xs font-semibold uppercase tracking-[0.1em] text-secondary underline underline-offset-4 transition-colors hover:text-primary"
    >
      {t("signOut")}
    </button>
  );
}
