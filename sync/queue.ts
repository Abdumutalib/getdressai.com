import { v4 as uuidv4 } from "uuid";
import { localDB } from "@/db/indexeddb";
import type { SyncOperation, SyncStatus } from "@/types";

type EnqueuePayload = {
  deviceId: string;
  userId: string;
  operationType: string;
  entity: string;
  entityId: string;
  payload: Record<string, unknown>;
  idempotencyKey?: string;
};

export async function enqueueOperation(input: EnqueuePayload): Promise<SyncOperation> {
  const now = new Date().toISOString();
  const op: SyncOperation = {
    id: uuidv4(),
    device_id: input.deviceId,
    user_id: input.userId,
    timestamp: now,
    operation_type: input.operationType,
    entity: input.entity,
    entity_id: input.entityId,
    payload: input.payload,
    sync_status: "pending",
    idempotency_key: input.idempotencyKey ?? uuidv4(),
    error: null,
    retry_count: 0,
    created_at: now,
    synced_at: null,
  };

  await localDB.sync_queue.add(op);
  return op;
}

export async function getPendingOperations(limit = 100): Promise<SyncOperation[]> {
  return localDB.sync_queue.where("sync_status").equals("pending").limit(limit).toArray();
}

export async function markSyncStatus(id: string, status: SyncStatus, error: string | null = null) {
  await localDB.sync_queue.update(id, {
    sync_status: status,
    error,
    synced_at: status === "synced" ? new Date().toISOString() : null,
  });
}

export async function countPendingOperations() {
  return localDB.sync_queue.where("sync_status").equals("pending").count();
}
