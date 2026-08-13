import { beforeEach, describe, expect, it } from "vitest";
import { localDB } from "@/db/indexeddb";
import { countPendingOperations, enqueueOperation, markSyncStatus } from "@/sync/queue";

describe("offline sync queue", () => {
  beforeEach(async () => {
    await localDB.delete();
    localDB.open();
  });

  it("stores local operation as pending", async () => {
    const op = await enqueueOperation({
      deviceId: "device-a",
      userId: "00000000-0000-0000-0000-000000000001",
      operationType: "sales.create",
      entity: "sales",
      entityId: "00000000-0000-0000-0000-000000000111",
      payload: { total: 1500000 },
      idempotencyKey: "idempotency-1",
    });

    expect(op.sync_status).toBe("pending");
    await expect(countPendingOperations()).resolves.toBe(1);
  });

  it("marks operation synced", async () => {
    const op = await enqueueOperation({
      deviceId: "device-a",
      userId: "00000000-0000-0000-0000-000000000001",
      operationType: "sales.create",
      entity: "sales",
      entityId: "00000000-0000-0000-0000-000000000111",
      payload: { total: 1500000 },
      idempotencyKey: "idempotency-2",
    });

    await markSyncStatus(op.id, "synced");
    const updated = await localDB.sync_queue.get(op.id);

    expect(updated?.sync_status).toBe("synced");
    expect(updated?.synced_at).toBeTruthy();
  });
});
