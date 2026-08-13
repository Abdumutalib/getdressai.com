"use client";

import { useEffect, useState } from "react";
import { ProductForm } from "@/features/products/product-form";
import type { Product } from "@/types";

export function ProductsPageClient() {
  const [rows, setRows] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/private/products");
    const json = await res.json();
    setRows(json.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    let active = true;

    void (async () => {
      const res = await fetch("/api/private/products");
      const json = await res.json();
      if (!active) return;
      setRows(json.data ?? []);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <ProductForm onSaved={load} />

      <div className="overflow-x-auto rounded-2xl border border-[#d9cab1] bg-[#fffaf0]">
        <table className="min-w-full text-sm">
          <thead className="bg-[#f4e7d1] text-left text-[#5f4a33]">
            <tr>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Номи</th>
              <th className="px-4 py-3">Ўлчов</th>
              <th className="px-4 py-3">Чакана нарх</th>
              <th className="px-4 py-3">Ҳолат</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-t border-[#ebdfcb]">
                <td className="px-4 py-3">{p.sku}</td>
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3">{p.unit}</td>
                <td className="px-4 py-3">{Number(p.retail_price).toLocaleString("uz-UZ")} сўм</td>
                <td className="px-4 py-3">{p.active ? "Фаол" : "Нофаол"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && rows.length === 0 && <p className="p-4 text-sm text-[#755f46]">Ҳозирча товарлар йўқ.</p>}
      </div>
    </div>
  );
}
