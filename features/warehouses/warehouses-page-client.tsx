"use client";

import { useEffect, useState } from "react";
import { WarehouseForm } from "@/features/warehouses/warehouse-form";
import type { Warehouse } from "@/types";

export function WarehousesPageClient() {
  const [rows, setRows] = useState<Warehouse[]>([]);

  async function load() {
    const res = await fetch("/api/private/warehouses");
    const json = await res.json();
    setRows(json.data ?? []);
  }

  useEffect(() => {
    let active = true;

    void (async () => {
      const res = await fetch("/api/private/warehouses");
      const json = await res.json();
      if (!active) return;
      setRows(json.data ?? []);
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <WarehouseForm onSaved={load} />

      <div className="overflow-x-auto rounded-2xl border border-[#d9cab1] bg-[#fffaf0]">
        <table className="min-w-full text-sm">
          <thead className="bg-[#f4e7d1] text-left text-[#5f4a33]">
            <tr>
              <th className="px-4 py-3">Номи</th>
              <th className="px-4 py-3">Манзил</th>
              <th className="px-4 py-3">Ҳолат</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((w) => (
              <tr key={w.id} className="border-t border-[#ebdfcb]">
                <td className="px-4 py-3">{w.name}</td>
                <td className="px-4 py-3">{w.address ?? "-"}</td>
                <td className="px-4 py-3">{w.active ? "Фаол" : "Нофаол"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && <p className="p-4 text-sm text-[#755f46]">Ҳозирча омборлар йўқ.</p>}
      </div>
    </div>
  );
}
