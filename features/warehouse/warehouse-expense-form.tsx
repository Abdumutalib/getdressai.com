"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { enqueueOperation } from "@/sync/queue";
import { localDB } from "@/db/indexeddb";
import { useNetworkStore } from "@/stores/network-store";

type StockExpenseFormValues = {
  warehouse_id: string;
  product_id: string;
  quantity: number;
  reason: "ишлаб чиқариш" | "бузилган" | "реклама" | "ички фойдаланиш" | "бошқа";
  comment: string;
};

const defaultValues: StockExpenseFormValues = {
  warehouse_id: "",
  product_id: "",
  quantity: 1,
  reason: "бузилган",
  comment: "",
};

export function WarehouseExpenseForm() {
  const router = useRouter();
  const setPendingCount = useNetworkStore((state) => state.setPendingCount);
  const { register, handleSubmit, reset } = useForm<StockExpenseFormValues>({ defaultValues });

  const submit = handleSubmit(async (values) => {
    const idempotencyKey = uuidv4();
    const payload = {
      warehouse_id: values.warehouse_id,
      product_id: values.product_id,
      quantity: Number(values.quantity),
      reason: values.reason,
      comment: values.comment || null,
      idempotency_key: idempotencyKey,
    };

    if (!navigator.onLine) {
      await enqueueOperation({
        deviceId: localStorage.getItem("akbel.device_id") ?? "web-device",
        userId: localStorage.getItem("akbel.user_id") ?? "00000000-0000-0000-0000-000000000000",
        operationType: "warehouse.expense",
        entity: "stock_transactions",
        entityId: idempotencyKey,
        payload,
        idempotencyKey,
      });
      const pending = await localDB.sync_queue.where("sync_status").equals("pending").count();
      setPendingCount(pending);
      reset(defaultValues);
      return;
    }

    const res = await fetch("/api/private/warehouse/expense", {
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
        <input className="rounded-xl border border-[#d9cab1] px-3 py-2" placeholder="Warehouse ID" {...register("warehouse_id")} />
        <input className="rounded-xl border border-[#d9cab1] px-3 py-2" placeholder="Product ID" {...register("product_id")} />
        <input type="number" className="rounded-xl border border-[#d9cab1] px-3 py-2" placeholder="Миқдор" {...register("quantity", { valueAsNumber: true })} />
        <select className="rounded-xl border border-[#d9cab1] px-3 py-2" {...register("reason")}>
          <option value="ишлаб чиқариш">ишлаб чиқариш</option>
          <option value="бузилган">бузилган</option>
          <option value="реклама">реклама</option>
          <option value="ички фойдаланиш">ички фойдаланиш</option>
          <option value="бошқа">бошқа</option>
        </select>
        <textarea className="rounded-xl border border-[#d9cab1] px-3 py-2 md:col-span-2" placeholder="Изоҳ" {...register("comment")} />
      </div>

      <button type="submit" className="rounded-xl bg-[#8b5e34] px-5 py-3 font-bold text-white">
        Омбор чиқимини сақлаш
      </button>
    </form>
  );
}
