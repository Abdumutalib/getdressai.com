"use client";

import { useForm } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { enqueueOperation } from "@/sync/queue";
import { localDB } from "@/db/indexeddb";
import { useNetworkStore } from "@/stores/network-store";

type PaymentFormValues = {
  entity_type: "customer" | "supplier";
  customer_id: string;
  supplier_id: string;
  amount: number;
  method: "Нақд" | "Карта" | "Банк" | "Click" | "Payme" | "Бошқа";
  direction: "income" | "expense";
  cash_account_id: string;
  comment: string;
  reference_id: string;
  reference_type: string;
};

const defaultValues: PaymentFormValues = {
  entity_type: "customer",
  customer_id: "",
  supplier_id: "",
  amount: 0,
  method: "Нақд",
  direction: "income",
  cash_account_id: "",
  comment: "",
  reference_id: "",
  reference_type: "",
};

export function PaymentForm() {
  const router = useRouter();
  const setPendingCount = useNetworkStore((state) => state.setPendingCount);
  const { register, handleSubmit, reset, control } = useForm<PaymentFormValues>({ defaultValues });
  const entityType = useWatch({ control, name: "entity_type" });

  const submit = handleSubmit(async (values) => {
    const idempotencyKey = uuidv4();
    const payload = {
      entity_type: values.entity_type,
      customer_id: values.entity_type === "customer" ? values.customer_id || null : null,
      supplier_id: values.entity_type === "supplier" ? values.supplier_id || null : null,
      amount: Number(values.amount),
      method: values.method,
      direction: values.direction,
      cash_account_id: values.cash_account_id,
      comment: values.comment || null,
      reference_id: values.reference_id || null,
      reference_type: values.reference_type || null,
      idempotency_key: idempotencyKey,
    };

    if (!navigator.onLine) {
      await localDB.payments.add({
        id: uuidv4(),
        ...payload,
        employee_id: "local",
        cancelled: false,
        cancelled_at: null,
        cancelled_by: null,
        created_at: new Date().toISOString(),
      } as never);
      await enqueueOperation({
        deviceId: localStorage.getItem("akbel.device_id") ?? "web-device",
        userId: localStorage.getItem("akbel.user_id") ?? "00000000-0000-0000-0000-000000000000",
        operationType: "payments.create",
        entity: "payments",
        entityId: idempotencyKey,
        payload,
        idempotencyKey,
      });
      const pending = await localDB.sync_queue.where("sync_status").equals("pending").count();
      setPendingCount(pending);
      reset(defaultValues);
      return;
    }

    const res = await fetch("/api/private/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-device-id": localStorage.getItem("akbel.device_id") ?? "web-device" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      alert(await res.text());
      return;
    }

    reset(defaultValues);
    router.refresh();
  });

  return (
    <form onSubmit={submit} className="space-y-6 rounded-2xl border border-[#d9cab1] bg-[#fffaf0] p-4">
      <div className="grid gap-3 md:grid-cols-2">
        <select className="rounded-xl border border-[#d9cab1] px-3 py-2" {...register("entity_type")}>
          <option value="customer">Customer</option>
          <option value="supplier">Supplier</option>
        </select>
        <input type="number" className="rounded-xl border border-[#d9cab1] px-3 py-2" placeholder="Сумма" {...register("amount", { valueAsNumber: true })} />
        {entityType === "customer" ? (
          <input className="rounded-xl border border-[#d9cab1] px-3 py-2" placeholder="Customer ID" {...register("customer_id")} />
        ) : (
          <input className="rounded-xl border border-[#d9cab1] px-3 py-2" placeholder="Supplier ID" {...register("supplier_id")} />
        )}
        <input className="rounded-xl border border-[#d9cab1] px-3 py-2" placeholder="Cash account ID" {...register("cash_account_id")} />
        <select className="rounded-xl border border-[#d9cab1] px-3 py-2" {...register("method")}>
          <option value="Нақд">Нақд</option>
          <option value="Карта">Карта</option>
          <option value="Банк">Банк</option>
          <option value="Click">Click</option>
          <option value="Payme">Payme</option>
          <option value="Бошқа">Бошқа</option>
        </select>
        <select className="rounded-xl border border-[#d9cab1] px-3 py-2" {...register("direction")}>
          <option value="income">income</option>
          <option value="expense">expense</option>
        </select>
        <input className="rounded-xl border border-[#d9cab1] px-3 py-2" placeholder="Reference ID" {...register("reference_id")} />
        <input className="rounded-xl border border-[#d9cab1] px-3 py-2" placeholder="Reference type" {...register("reference_type")} />
        <textarea className="rounded-xl border border-[#d9cab1] px-3 py-2 md:col-span-2" placeholder="Изоҳ" {...register("comment")} />
      </div>

      <button type="submit" className="rounded-xl bg-[#8b5e34] px-5 py-3 font-bold text-white">
        Тўловни сақлаш
      </button>
    </form>
  );
}
