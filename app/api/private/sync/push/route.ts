import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";
import { fail, ok } from "@/lib/response";
import { isServerOnlyMode } from "@/lib/runtime-mode";

const syncOperationSchema = z.object({
  id: z.string().uuid(),
  device_id: z.string().min(1).max(200),
  user_id: z.string().uuid(),
  operation_type: z.string().min(1).max(100),
  entity: z.string().min(1).max(100),
  entity_id: z.string().uuid(),
  payload: z.record(z.string(), z.unknown()),
  idempotency_key: z.string().min(8).max(200),
});

type SupportedOperation =
  | { entity: "sales"; operationType: "sales.create" | "sales.cash.create"; permission: "sales.create" }
  | { entity: "purchases"; operationType: "purchases.create"; permission: "purchases.create" }
  | { entity: "payments"; operationType: "payments.create"; permission: "payments.create" }
  | { entity: "expenses"; operationType: "expenses.create"; permission: "expenses.create" };

function resolveOperation(entity: string, operationType: string): SupportedOperation | null {
  if (entity === "sales" && (operationType === "sales.create" || operationType === "sales.cash.create")) {
    return { entity, operationType, permission: "sales.create" };
  }
  if (entity === "purchases" && operationType === "purchases.create") {
    return { entity, operationType, permission: "purchases.create" };
  }
  if (entity === "payments" && operationType === "payments.create") {
    return { entity, operationType, permission: "payments.create" };
  }
  if (entity === "expenses" && operationType === "expenses.create") {
    return { entity, operationType, permission: "expenses.create" };
  }
  return null;
}

export async function POST(request: Request) {
  if (isServerOnlyMode()) {
    // Do not return a successful response for an operation that was not persisted.
    return fail("Синхронизация ишламайди: Supabase сервер муҳити созланмаган.", 503);
  }

  try {
    const body = await request.json();
    const parsed = syncOperationSchema.safeParse(body);

    if (!parsed.success) {
      return fail("Синхронизация маълумоти нотўғри.", 422);
    }

    const operation = resolveOperation(parsed.data.entity, parsed.data.operation_type);
    if (!operation) {
      return fail(
        `Синхронизация тури қўллаб-қувватланмайди: ${parsed.data.entity}/${parsed.data.operation_type}. Маълумот йўқолмаслиги учун операция синхронланган деб белгиланмади.`,
        422
      );
    }

    const user = await requirePermission(operation.permission);
    const supabase = await createClient();
    const payload = parsed.data.payload;

    if (payload.idempotency_key !== parsed.data.idempotency_key) {
      return fail("Idempotency калити операция маълумотига мос эмас.", 422);
    }

    const existing = await supabase
      .from("sync_queue")
      .select("id, sync_status")
      .eq("idempotency_key", parsed.data.idempotency_key)
      .maybeSingle();

    if (existing.error) {
      return fail(existing.error.message, 400);
    }
    if (existing.data) {
      return ok({ synced: existing.data.sync_status === "synced", duplicate: true, operation: existing.data });
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
      const payloadChanged =
        JSON.stringify(recentEntityOp.data.payload ?? {}) !== JSON.stringify(payload ?? {});

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
            data: { id: conflictId, serverOperation: recentEntityOp.data },
            error: "Маълумот зиддияти аниқланди.",
          },
          { status: 409 }
        );
      }
    }

    // Apply the business transaction first. The database RPCs are idempotent and
    // update stock/debt/cash atomically. The queue is marked synced only afterward.
    let rpcName: string;
    let rpcArgs: Record<string, unknown>;

    if (operation.entity === "sales") {
      rpcName = "confirm_sale";
      rpcArgs = {
        p_sale: {
          customer_id: payload.customer_id ?? null,
          employee_id: user.id,
          warehouse_id: payload.warehouse_id,
          discount: payload.discount ?? 0,
          paid_amount: payload.paid_amount ?? 0,
          debt_amount: payload.debt_amount ?? 0,
          payment_method: payload.payment_method,
          cash_account_id: payload.cash_account_id ?? null,
          notes: payload.notes ?? null,
          idempotency_key: parsed.data.idempotency_key,
          status: payload.status ?? "confirmed",
        },
        p_items: payload.items,
        p_user_id: user.id,
        p_device_id: parsed.data.device_id,
      };
    } else if (operation.entity === "purchases") {
      rpcName = "confirm_purchase";
      rpcArgs = {
        p_purchase: {
          supplier_id: payload.supplier_id,
          employee_id: user.id,
          warehouse_id: payload.warehouse_id,
          paid_amount: payload.paid_amount ?? 0,
          debt_amount: payload.debt_amount ?? 0,
          payment_method: payload.payment_method,
          cash_account_id: payload.cash_account_id ?? null,
          notes: payload.notes ?? null,
          idempotency_key: parsed.data.idempotency_key,
          status: payload.status ?? "confirmed",
        },
        p_items: payload.items,
        p_user_id: user.id,
        p_device_id: parsed.data.device_id,
      };
    } else if (operation.entity === "payments") {
      rpcName = "register_payment";
      rpcArgs = {
        p_payment: { ...payload, employee_id: user.id, idempotency_key: parsed.data.idempotency_key },
        p_user_id: user.id,
        p_device_id: parsed.data.device_id,
      };
    } else {
      rpcName = "register_expense";
      rpcArgs = {
        p_expense: { ...payload, employee_id: user.id, idempotency_key: parsed.data.idempotency_key },
        p_user_id: user.id,
        p_device_id: parsed.data.device_id,
      };
    }

    if (!Array.isArray(payload.items) && (operation.entity === "sales" || operation.entity === "purchases")) {
      return fail("Сотув/киримда товарлар рўйхати йўқ.", 422);
    }

    const { data: applied, error: applyError } = await supabase.rpc(rpcName, rpcArgs);
    if (applyError) {
      return fail(applyError.message, 400);
    }

    const { data, error } = await supabase
      .from("sync_queue")
      .insert({
        id: parsed.data.id,
        device_id: parsed.data.device_id,
        // Trust the authenticated session, not the client-provided user_id.
        user_id: user.id,
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
      // The business RPC is idempotent: a retry can safely record the queue item.
      return fail(error.message, 500);
    }

    const { error: deviceError } = await supabase.from("devices").upsert(
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

    if (deviceError) {
      // The business operation is already applied; do not report it as failed.
      console.error("Sync device heartbeat failed", deviceError.message);
    }

    return ok({ synced: true, operation: data, applied });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Sync xatoligi", 500);
  }
}
