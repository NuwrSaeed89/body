"use client";

import { useState, type ReactNode } from "react";
import { HomeInitialLoader } from "./home-initial-loader";

type HomePageClientShellProps = {
  children: ReactNode;
};

export function HomePageClientShell({ children }: HomePageClientShellProps) {
  const [showLoader, setShowLoader] = useState(true);

  return (
    <>
      {showLoader && (
        <HomeInitialLoader onComplete={() => setShowLoader(false)} />
      )}
      {children}
    </>
  );
}
