"use client";

import { useEffect } from "react";
import { useNetworkStore } from "@/stores/network-store";
import { SyncManager } from "@/features/sync/sync-manager";
import { runSyncCycle } from "@/sync/engine";

export function SyncPageClient() {
  const pendingCount = useNetworkStore((state) => state.pendingCount);
  const status = useNetworkStore((state) => state.status);

  useEffect(() => {
    void runSyncCycle();
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#dbcdb6] bg-[#fffaf0] p-5 shadow-sm">
        <h1 className="text-3xl font-black text-[#3e2d1f]">Синхрон маркази</h1>
        <p className="mt-2 text-sm text-[#6d5a45]">
          Ҳолат: <span className="font-bold">{status.toUpperCase()}</span> • Pending: <span className="font-bold">{pendingCount}</span>
        </p>
      </section>

      <SyncManager />
    </div>
  );
}
