"use client";

import { usePathname } from "@/i18n/navigation";
import {
  MOBILE_NAV_HEIGHT,
  MobileBottomNav,
  shouldHideMobileBottomNav,
} from "./mobile-bottom-nav";

type MobileLayoutShellProps = {
  children: React.ReactNode;
};

export function MobileLayoutShell({ children }: MobileLayoutShellProps) {
  const pathname = usePathname();
  const showNav = !shouldHideMobileBottomNav(pathname);

  return (
    <>
      <div
        className={showNav ? "pb-[calc(var(--mobile-nav-height)+env(safe-area-inset-bottom))] md:pb-0" : undefined}
      >
        {children}
      </div>
      <MobileBottomNav />
    </>
  );
}

export { MOBILE_NAV_HEIGHT };
