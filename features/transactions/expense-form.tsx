"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { enqueueOperation } from "@/sync/queue";
import { localDB } from "@/db/indexeddb";
import { useNetworkStore } from "@/stores/network-store";

type ExpenseFormValues = {
  category_id: string;
  amount: number;
  cash_account_id: string;
  comment: string;
};

const defaultValues: ExpenseFormValues = {
  category_id: "",
  amount: 0,
  cash_account_id: "",
  comment: "",
};

export function ExpenseForm() {
  const router = useRouter();
  const setPendingCount = useNetworkStore((state) => state.setPendingCount);
  const { register, handleSubmit, reset } = useForm<ExpenseFormValues>({ defaultValues });

  const submit = handleSubmit(async (values) => {
    const idempotencyKey = uuidv4();
    const payload = {
      category_id: values.category_id,
      amount: Number(values.amount),
      cash_account_id: values.cash_account_id,
      comment: values.comment || null,
      idempotency_key: idempotencyKey,
    };

    if (!navigator.onLine) {
      await localDB.expenses.add({
        id: uuidv4(),
        category_id: values.category_id,
        amount: Number(values.amount),
        cash_account_id: values.cash_account_id,
        employee_id: "local",
        comment: values.comment || null,
        idempotency_key: idempotencyKey,
        created_at: new Date().toISOString(),
      } as never);
      await enqueueOperation({
        deviceId: localStorage.getItem("akbel.device_id") ?? "web-device",
        userId: localStorage.getItem("akbel.user_id") ?? "00000000-0000-0000-0000-000000000000",
        operationType: "expenses.create",
        entity: "expenses",
        entityId: idempotencyKey,
        payload,
        idempotencyKey,
      });
      const pending = await localDB.sync_queue.where("sync_status").equals("pending").count();
      setPendingCount(pending);
      reset(defaultValues);
      return;
    }

    const res = await fetch("/api/private/expenses", {
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
        <input className="rounded-xl border border-[#d9cab1] px-3 py-2" placeholder="Category ID" {...register("category_id")} />
        <input className="rounded-xl border border-[#d9cab1] px-3 py-2" placeholder="Cash account ID" {...register("cash_account_id")} />
        <input type="number" className="rounded-xl border border-[#d9cab1] px-3 py-2" placeholder="Сумма" {...register("amount", { valueAsNumber: true })} />
        <textarea className="rounded-xl border border-[#d9cab1] px-3 py-2 md:col-span-2" placeholder="Изоҳ" {...register("comment")} />
      </div>

      <button type="submit" className="rounded-xl bg-[#8b5e34] px-5 py-3 font-bold text-white">
        Харажатни сақлаш
      </button>
    </form>
  );
}
