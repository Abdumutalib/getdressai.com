"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { enqueueOperation } from "@/sync/queue";
import { localDB } from "@/db/indexeddb";
import { useNetworkStore } from "@/stores/network-store";

type PurchaseItemForm = {
  product_id: string;
  warehouse_id: string;
  quantity: number;
  price: number;
};

type PurchaseFormValues = {
  supplier_id: string;
  warehouse_id: string;
  payment_method: "Нақд" | "Карта" | "Банк" | "Click" | "Payme" | "Бошқа";
  cash_account_id: string;
  paid_amount: number;
  debt_amount: number;
  notes: string;
  items: PurchaseItemForm[];
};

const defaultItem = (): PurchaseItemForm => ({ product_id: "", warehouse_id: "", quantity: 1, price: 0 });

const defaultValues: PurchaseFormValues = {
  supplier_id: "",
  warehouse_id: "",
  payment_method: "Нақд",
  cash_account_id: "",
  paid_amount: 0,
  debt_amount: 0,
  notes: "",
  items: [defaultItem()],
};

export function PurchaseForm() {
  const router = useRouter();
  const setPendingCount = useNetworkStore((state) => state.setPendingCount);
  const { register, control, handleSubmit, reset } = useForm<PurchaseFormValues>({ defaultValues });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const submit = handleSubmit(async (values) => {
    const idempotencyKey = uuidv4();
    const payload = {
      supplier_id: values.supplier_id,
      warehouse_id: values.warehouse_id,
      items: values.items.map((item) => ({
        product_id: item.product_id,
        warehouse_id: item.warehouse_id || values.warehouse_id,
        quantity: Number(item.quantity),
        price: Number(item.price),
      })),
      paid_amount: Number(values.paid_amount || 0),
      debt_amount: Number(values.debt_amount || 0),
      payment_method: values.payment_method,
      cash_account_id: values.cash_account_id || null,
      notes: values.notes || null,
      idempotency_key: idempotencyKey,
      status: "confirmed",
    };

    if (!navigator.onLine) {
      await localDB.purchases.add({
        id: uuidv4(),
        supplier_id: values.supplier_id,
        employee_id: "local",
        items: payload.items,
        total: payload.items.reduce((sum, item) => sum + item.quantity * item.price, 0),
        paid_amount: payload.paid_amount,
        debt_amount: payload.debt_amount,
        payment_method: payload.payment_method,
        cash_account_id: payload.cash_account_id,
        status: "draft",
        notes: payload.notes,
        idempotency_key: idempotencyKey,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as never);
      await enqueueOperation({
        deviceId: localStorage.getItem("akbel.device_id") ?? "web-device",
        userId: localStorage.getItem("akbel.user_id") ?? "00000000-0000-0000-0000-000000000000",
        operationType: "purchases.create",
        entity: "purchases",
        entityId: idempotencyKey,
        payload,
        idempotencyKey,
      });
      const pending = await localDB.sync_queue.where("sync_status").equals("pending").count();
      setPendingCount(pending);
      reset(defaultValues);
      return;
    }

    const res = await fetch("/api/private/purchases", {
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
        <input className="rounded-xl border border-[#d9cab1] px-3 py-2" placeholder="Supplier ID" {...register("supplier_id")} />
        <input className="rounded-xl border border-[#d9cab1] px-3 py-2" placeholder="Warehouse ID" {...register("warehouse_id")} />
        <select className="rounded-xl border border-[#d9cab1] px-3 py-2" {...register("payment_method")}>
          <option value="Нақд">Нақд</option>
          <option value="Карта">Карта</option>
          <option value="Банк">Банк</option>
          <option value="Click">Click</option>
          <option value="Payme">Payme</option>
          <option value="Бошқа">Бошқа</option>
        </select>
        <input className="rounded-xl border border-[#d9cab1] px-3 py-2" placeholder="Cash account ID" {...register("cash_account_id")} />
        <input type="number" className="rounded-xl border border-[#d9cab1] px-3 py-2" placeholder="Тўланган сумма" {...register("paid_amount", { valueAsNumber: true })} />
        <input type="number" className="rounded-xl border border-[#d9cab1] px-3 py-2" placeholder="Қарз сумма" {...register("debt_amount", { valueAsNumber: true })} />
        <textarea className="rounded-xl border border-[#d9cab1] px-3 py-2 md:col-span-2" placeholder="Изоҳ" {...register("notes")} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#3e2d1f]">Товарлар</h3>
          <button type="button" onClick={() => append(defaultItem())} className="rounded-xl border border-[#d9cab1] px-3 py-2 text-sm font-semibold">
            + Қўшиш
          </button>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="grid gap-3 rounded-xl border border-[#eadfcf] bg-white p-3 md:grid-cols-5">
            <input className="rounded-lg border border-[#d9cab1] px-3 py-2" placeholder="Product ID" {...register(`items.${index}.product_id` as const)} />
            <input className="rounded-lg border border-[#d9cab1] px-3 py-2" placeholder="Warehouse ID" {...register(`items.${index}.warehouse_id` as const)} />
            <input type="number" className="rounded-lg border border-[#d9cab1] px-3 py-2" placeholder="Миқдор" {...register(`items.${index}.quantity` as const, { valueAsNumber: true })} />
            <input type="number" className="rounded-lg border border-[#d9cab1] px-3 py-2" placeholder="Нарх" {...register(`items.${index}.price` as const, { valueAsNumber: true })} />
            <div className="flex items-center justify-end">
              {fields.length > 1 && (
                <button type="button" onClick={() => remove(index)} className="rounded-lg border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700">
                  Ўчириш
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button type="submit" className="rounded-xl bg-[#8b5e34] px-5 py-3 font-bold text-white">
        Киримни сақлаш
      </button>
    </form>
  );
}
