"use client";

import { useRouter } from "@/i18n/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { hasSupabaseConfig } from "@/lib/env";

export function AdminSignOutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        void (async () => {
          if (hasSupabaseConfig()) {
            const supabase = createSupabaseBrowserClient();
            await supabase.auth.signOut();
          }
          router.push("/admin/login");
          router.refresh();
        })();
      }}
      className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant underline underline-offset-2 transition-colors hover:text-primary"
    >
      Sign out
    </button>
  );
}
