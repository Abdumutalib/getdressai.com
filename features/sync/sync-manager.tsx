"use client";

import { useEffect, useState } from "react";
import { localDB } from "@/db/indexeddb";
import { countPendingOperations } from "@/sync/queue";
import type { SyncOperation, SyncConflict } from "@/types";

export function SyncManager() {
  const [pending, setPending] = useState<SyncOperation[]>([]);
  const [failed, setFailed] = useState<SyncOperation[]>([]);
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  async function loadData() {
    const [pendingOps, failedOps, conflictOps, pendingTotal] = await Promise.all([
      localDB.sync_queue.where("sync_status").equals("pending").reverse().sortBy("created_at"),
      localDB.sync_queue.where("sync_status").equals("failed").reverse().sortBy("created_at"),
      localDB.sync_conflicts.toArray(),
      countPendingOperations(),
    ]);

    setPending(pendingOps.slice(0, 20));
    setFailed(failedOps.slice(0, 20));
    setConflicts(conflictOps.slice(0, 20));
    setPendingCount(pendingTotal);
  }

  async function resolveConflict(conflict: SyncConflict, resolution: "a" | "b") {
    const now = new Date().toISOString();

    await localDB.sync_conflicts.update(conflict.id, {
      resolved: true,
      resolution,
      resolved_at: now,
      resolved_by: conflict.operation_a.user_id,
    });

    if (resolution === "a") {
      await localDB.sync_queue.update(conflict.operation_a.id, {
        sync_status: "pending",
        error: "Conflict resolved: local version selected",
      });
    } else {
      await localDB.sync_queue.update(conflict.operation_a.id, {
        sync_status: "failed",
        error: "Conflict resolved: server version selected",
      });
    }

    await loadData();
  }

  useEffect(() => {
    let active = true;

    void (async () => {
      const [pendingOps, failedOps, conflictOps, pendingTotal] = await Promise.all([
        localDB.sync_queue.where("sync_status").equals("pending").reverse().sortBy("created_at"),
        localDB.sync_queue.where("sync_status").equals("failed").reverse().sortBy("created_at"),
        localDB.sync_conflicts.toArray(),
        countPendingOperations(),
      ]);

      if (!active) return;

      setPending(pendingOps.slice(0, 20));
      setFailed(failedOps.slice(0, 20));
      setConflicts(conflictOps.slice(0, 20));
      setPendingCount(pendingTotal);
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-[#dbcdb6] bg-[#fffaf0] p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#8b6e4f]">Pending</p>
          <p className="mt-3 text-2xl font-black text-[#3d2d1f]">{pendingCount}</p>
        </article>
        <article className="rounded-2xl border border-[#dbcdb6] bg-[#fffaf0] p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#8b6e4f]">Failed</p>
          <p className="mt-3 text-2xl font-black text-[#3d2d1f]">{failed.length}</p>
        </article>
        <article className="rounded-2xl border border-[#dbcdb6] bg-[#fffaf0] p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#8b6e4f]">Conflicts</p>
          <p className="mt-3 text-2xl font-black text-[#3d2d1f]">{conflicts.length}</p>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-[#dbcdb6] bg-[#fffaf0] p-5">
          <h2 className="text-lg font-extrabold text-[#3e2d1f]">Синхрон кутувчи операциялар</h2>
          <div className="mt-4 space-y-3">
            {pending.length === 0 ? (
              <p className="text-sm text-[#6d5a45]">Pending операция йўқ.</p>
            ) : (
              pending.map((op) => (
                <div key={op.id} className="rounded-xl bg-[#f6eddc] px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-[#4a3725]">{op.entity} / {op.operation_type}</span>
                    <span className="text-xs text-[#7a6248]">{new Date(op.created_at).toLocaleString("uz-UZ")}</span>
                  </div>
                  <p className="mt-1 text-xs text-[#7a6248]">Idempotency: {op.idempotency_key}</p>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-[#dbcdb6] bg-[#fffaf0] p-5">
          <h2 className="text-lg font-extrabold text-[#3e2d1f]">Хатоли операциялар</h2>
          <div className="mt-4 space-y-3">
            {failed.length === 0 ? (
              <p className="text-sm text-[#6d5a45]">Failed операция йўқ.</p>
            ) : (
              failed.map((op) => (
                <div key={op.id} className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-900">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold">{op.entity} / {op.operation_type}</span>
                    <span className="text-xs">{new Date(op.created_at).toLocaleString("uz-UZ")}</span>
                  </div>
                  <p className="mt-1 text-xs">{op.error ?? "Номаълум хато"}</p>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-[#dbcdb6] bg-[#fffaf0] p-5">
        <h2 className="text-lg font-extrabold text-[#3e2d1f]">Conflict queue</h2>
        <div className="mt-4 space-y-3">
          {conflicts.length === 0 ? (
            <p className="text-sm text-[#6d5a45]">Conflict топилмади.</p>
          ) : (
            conflicts.map((item) => (
              <div key={item.id} className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-950">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold">{item.entity}</span>
                  <span className="text-xs">{new Date(item.created_at).toLocaleString("uz-UZ")}</span>
                </div>
                <p className="mt-1 text-xs">Entity ID: {item.entity_id}</p>
                <p className="mt-1 text-xs">Resolution: {item.resolution ?? "pending"}</p>
                {!item.resolved && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void resolveConflict(item, "a")}
                      className="rounded-lg bg-[#6b4f33] px-3 py-2 text-xs font-semibold text-white"
                    >
                      Локални қабул қилиш
                    </button>
                    <button
                      type="button"
                      onClick={() => void resolveConflict(item, "b")}
                      className="rounded-lg bg-[#334155] px-3 py-2 text-xs font-semibold text-white"
                    >
                      Серверни қабул қилиш
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
