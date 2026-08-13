import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { fail, ok } from "@/lib/response";
import { isServerOnlyMode } from "@/lib/runtime-mode";

const syncOperationSchema = z.object({
  id: z.string().uuid(),
  device_id: z.string().min(1),
  user_id: z.string().uuid(),
  operation_type: z.string().min(1),
  entity: z.string().min(1),
  entity_id: z.string().uuid(),
  payload: z.record(z.string(), z.unknown()),
  idempotency_key: z.string().min(1),
});

export async function POST(request: Request) {
  if (isServerOnlyMode()) {
    return ok({ synced: false, skipped: true, reason: "server_only_mode" });
  }

  try {
    const user = await requireUser();
    const supabase = await createClient();

    const body = await request.json();
    const parsed = syncOperationSchema.safeParse(body);

    if (!parsed.success) {
      return fail("Синхронизация маълумоти нотўғри.", 422);
    }

    if (parsed.data.user_id !== user.id) {
      return fail("Синхронизация учун рухсат йўқ.", 403);
    }

    const existing = await supabase
      .from("sync_queue")
      .select("id, sync_status")
      .eq("idempotency_key", parsed.data.idempotency_key)
      .maybeSingle();

    if (existing.data) {
      return ok({ duplicate: true, operation: existing.data });
    }

    const recentEntityOp = await supabase
      .from("sync_queue")
      .select("id, payload, user_id, operation_type, entity, entity_id, idempotency_key, created_at, sync_status")
      .eq("user_id", user.id)
      .eq("entity", parsed.data.entity)
      .eq("entity_id", parsed.data.entity_id)
      .neq("idempotency_key", parsed.data.idempotency_key)
      .in("sync_status", ["synced", "syncing", "pending"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentEntityOp.error) {
      return fail(recentEntityOp.error.message, 400);
    }

    if (recentEntityOp.data) {
      const payloadChanged = JSON.stringify(recentEntityOp.data.payload ?? {}) !== JSON.stringify(parsed.data.payload ?? {});

      if (payloadChanged) {
        const conflictId = crypto.randomUUID();

        const { error: conflictError } = await supabase.from("sync_conflicts").insert({
          id: conflictId,
          entity: parsed.data.entity,
          entity_id: parsed.data.entity_id,
          operation_a_id: parsed.data.id,
          operation_b_id: recentEntityOp.data.id,
          resolved: false,
          resolved_by: null,
          resolution: null,
        });

        if (conflictError) {
          return fail(conflictError.message, 400);
        }

        return Response.json(
          {
            success: false,
            data: {
              id: conflictId,
              serverOperation: recentEntityOp.data,
            },
            error: "Маълумот зиддияти аниқланди.",
          },
          { status: 409 }
        );
      }
    }

    const { data, error } = await supabase
      .from("sync_queue")
      .insert({
        id: parsed.data.id,
        device_id: parsed.data.device_id,
        user_id: parsed.data.user_id,
        operation_type: parsed.data.operation_type,
        entity: parsed.data.entity,
        entity_id: parsed.data.entity_id,
        payload: parsed.data.payload,
        idempotency_key: parsed.data.idempotency_key,
        sync_status: "synced",
        synced_at: new Date().toISOString(),
      })
      .select("id, sync_status")
      .single();

    if (error) {
      return fail(error.message, 400);
    }

    await supabase.from("devices").upsert(
      {
        id: parsed.data.device_id,
        user_id: user.id,
        name: "Web PWA",
        app_version: process.env.NEXT_PUBLIC_APP_VERSION ?? "2.0.0",
        last_active: new Date().toISOString(),
        last_sync: new Date().toISOString(),
        active: true,
      },
      { onConflict: "id" }
    );

    return ok({ synced: true, operation: data });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Sync xatoligi", 500);
  }
}
