"use client";

import { OFFLINE_STATUS } from "@/lib/constants";
import { localDB } from "@/db/indexeddb";
import { getPendingOperations, markSyncStatus } from "@/sync/queue";
import { useNetworkStore } from "@/stores/network-store";

const IS_SERVER_ONLY_MODE =
  process.env.NEXT_PUBLIC_APP_MODE === "server_only" ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let isRunning = false;

async function syncOneOperation(op: Awaited<ReturnType<typeof getPendingOperations>>[number]) {
  await markSyncStatus(op.id, "syncing", null);

  const response = await fetch("/api/private/sync/push", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(op),
  });

  if (response.status === 409) {
    const conflictPayload = await response.json();
    const serverOperation = conflictPayload?.data?.serverOperation;

    await localDB.sync_conflicts.put({
      id: conflictPayload?.data?.id ?? op.id,
      entity: op.entity,
      entity_id: op.entity_id,
      operation_a: op,
      operation_b: serverOperation
        ? {
            id: serverOperation.id,
            device_id: serverOperation.device_id,
            user_id: serverOperation.user_id,
            timestamp: serverOperation.created_at,
            operation_type: serverOperation.operation_type,
            entity: serverOperation.entity,
            entity_id: serverOperation.entity_id,
            payload: serverOperation.payload,
            sync_status: serverOperation.sync_status,
            idempotency_key: serverOperation.idempotency_key,
            error: null,
            retry_count: 0,
            created_at: serverOperation.created_at,
            synced_at: serverOperation.created_at,
          }
        : op,
      resolved: false,
      resolved_by: null,
      resolution: null,
      created_at: new Date().toISOString(),
      resolved_at: null,
    });
    await markSyncStatus(op.id, "conflict", conflictPayload?.error ?? "Conflict detected");
    return;
  }

  if (!response.ok) {
    const errorText = await response.text();
    await markSyncStatus(op.id, "failed", errorText || "Sync xatosi");
    return;
  }

  await markSyncStatus(op.id, "synced", null);
}

export async function runSyncCycle() {
  if (IS_SERVER_ONLY_MODE) {
    useNetworkStore.getState().setStatus(OFFLINE_STATUS.OFFLINE);
    return;
  }

  if (isRunning || !navigator.onLine) return;

  isRunning = true;
  useNetworkStore.getState().setStatus(OFFLINE_STATUS.SYNCING);

  try {
    const pending = await getPendingOperations(100);

    for (const op of pending) {
      await syncOneOperation(op);
    }

    const stillPending = await localDB.sync_queue.where("sync_status").equals("pending").count();
    useNetworkStore.getState().setPendingCount(stillPending);
    useNetworkStore.getState().setStatus(OFFLINE_STATUS.ONLINE);
  } catch {
    useNetworkStore.getState().setStatus(OFFLINE_STATUS.OFFLINE);
  } finally {
    isRunning = false;
  }
}

export function startAutoSync() {
  if (IS_SERVER_ONLY_MODE) {
    useNetworkStore.getState().setStatus(OFFLINE_STATUS.OFFLINE);
    return () => undefined;
  }

  const trigger = () => {
    if (navigator.onLine) {
      void runSyncCycle();
    } else {
      useNetworkStore.getState().setStatus(OFFLINE_STATUS.OFFLINE);
    }
  };

  window.addEventListener("online", trigger);
  const interval = window.setInterval(trigger, 15000);
  trigger();

  return () => {
    window.removeEventListener("online", trigger);
    window.clearInterval(interval);
  };
}
