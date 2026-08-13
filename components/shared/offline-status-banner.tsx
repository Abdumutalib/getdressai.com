"use client";

import { useMemo } from "react";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useNetworkStore } from "@/stores/network-store";

export function OfflineStatusBanner() {
  const status = useNetworkStatus();
  const pendingCount = useNetworkStore((s) => s.pendingCount);

  const text = useMemo(() => {
    if (status === "online") return "🟢 ONLINE";
    if (status === "syncing") return `🟠 SYNCING • ${pendingCount} та операция синхронланмоқда`;
    return `🔴 OFFLINE • ${pendingCount} та операция синхронизацияни кутмоқда`;
  }, [status, pendingCount]);

  const cls =
    status === "online"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status === "syncing"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-rose-50 text-rose-700 border-rose-200";

  return (
    <div className={`w-full border-b px-4 py-2 text-sm font-medium ${cls}`}>
      {text}
    </div>
  );
}
