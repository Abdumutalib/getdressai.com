"use client";

import { useForm } from "react-hook-form";

type ProductFormValues = {
  sku: string;
  name: string;
  unit: "кг" | "дона" | "қути" | "литр" | "метр";
  purchase_price: number;
  retail_price: number;
  wholesale_price: number;
  minimum_price: number;
  minimum_stock: number;
};

const initial: ProductFormValues = {
  sku: "",
  name: "",
  unit: "дона",
  purchase_price: 0,
  retail_price: 0,
  wholesale_price: 0,
  minimum_price: 0,
  minimum_stock: 0,
};

export function ProductForm({ onSaved }: { onSaved: () => Promise<void> | void }) {
  const { register, handleSubmit, reset } = useForm<ProductFormValues>({ defaultValues: initial });

  const onSubmit = handleSubmit(async (values) => {
    const res = await fetch("/api/private/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      alert("Товар сақлашда хато юз берди.");
      return;
    }

    reset(initial);
    await onSaved();
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl border border-[#d9cab1] bg-[#fffaf0] p-4 md:grid-cols-2">
      <input className="rounded-xl border border-[#d9cab1] px-3 py-2" placeholder="SKU" {...register("sku")} />
      <input className="rounded-xl border border-[#d9cab1] px-3 py-2" placeholder="Номи" {...register("name")} />

      <select className="rounded-xl border border-[#d9cab1] px-3 py-2" {...register("unit")}>
        <option value="кг">кг</option>
        <option value="дона">дона</option>
        <option value="қути">қути</option>
        <option value="литр">литр</option>
        <option value="метр">метр</option>
      </select>

      <input type="number" className="rounded-xl border border-[#d9cab1] px-3 py-2" placeholder="Харид нархи" {...register("purchase_price", { valueAsNumber: true })} />
      <input type="number" className="rounded-xl border border-[#d9cab1] px-3 py-2" placeholder="Чакана нарх" {...register("retail_price", { valueAsNumber: true })} />
      <input type="number" className="rounded-xl border border-[#d9cab1] px-3 py-2" placeholder="Улгуржи нарх" {...register("wholesale_price", { valueAsNumber: true })} />
      <input type="number" className="rounded-xl border border-[#d9cab1] px-3 py-2" placeholder="Минимал нарх" {...register("minimum_price", { valueAsNumber: true })} />
      <input type="number" className="rounded-xl border border-[#d9cab1] px-3 py-2" placeholder="Минимал қолдиқ" {...register("minimum_stock", { valueAsNumber: true })} />

      <button className="rounded-xl bg-[#8b5e34] px-4 py-2 font-bold text-white md:col-span-2">Сақлаш</button>
    </form>
  );
}
