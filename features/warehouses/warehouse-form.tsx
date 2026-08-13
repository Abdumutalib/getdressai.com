"use client";

import { useForm } from "react-hook-form";

type WarehouseFormValues = {
  name: string;
  address: string;
};

export function WarehouseForm({ onSaved }: { onSaved: () => Promise<void> | void }) {
  const { register, handleSubmit, reset } = useForm<WarehouseFormValues>({
    defaultValues: { name: "", address: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    const res = await fetch("/api/private/warehouses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      alert("Омбор сақлашда хато юз берди.");
      return;
    }

    reset({ name: "", address: "" });
    await onSaved();
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl border border-[#d9cab1] bg-[#fffaf0] p-4 md:grid-cols-2">
      <input className="rounded-xl border border-[#d9cab1] px-3 py-2" placeholder="Омбор номи" {...register("name")} />
      <input className="rounded-xl border border-[#d9cab1] px-3 py-2" placeholder="Манзил" {...register("address")} />

      <button className="rounded-xl bg-[#8b5e34] px-4 py-2 font-bold text-white md:col-span-2">Сақлаш</button>
    </form>
  );
}
