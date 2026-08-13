"use client";

import { useEffect } from "react";
import { startAutoSync } from "@/sync/engine";

export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const stop = startAutoSync();
    return stop;
  }, []);

  return <>{children}</>;
}
