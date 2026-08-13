import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isServerOnlyMode } from "@/lib/runtime-mode";
import { formatMoney } from "@/utils/currency";

export default async function OrdersPage() {
  const serverOnlyMode = isServerOnlyMode();
  let orders: Array<{
    id: string;
    order_number: string;
    total: number;
    status: string;
    delivery_address: string | null;
    created_at: string;
  }> = [];

  if (!serverOnlyMode) {
    await requirePermission("orders.view");
    const supabase = await createClient();

    const { data } = await supabase
      .from("orders")
      .select("id, order_number, total, status, delivery_address, created_at")
      .order("created_at", { ascending: false })
      .limit(30);

    orders = (data ?? []) as typeof orders;
  }

  return (
    <AppShell>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#3e2d1f]">Буюртмалар</h1>
          <p className="mt-2 text-sm text-[#6d5a45]">Савдо буйрутмаларининг тўлиқ lifecycle назорати.</p>
        </div>
        <Link href="/orders/new" className="rounded-xl bg-[#6b4f33] px-4 py-2 text-sm font-semibold text-white">Янги буюртма</Link>
      </section>

      <section className="mt-6 overflow-x-auto rounded-2xl border border-[#d9cab1] bg-[#fffaf0]">
        <table className="min-w-full text-sm">
          <thead className="bg-[#f4e7d1] text-left text-[#5f4a33]">
            <tr>
              <th className="px-4 py-3">Буюртма</th>
              <th className="px-4 py-3">Жами</th>
              <th className="px-4 py-3">Статус</th>
              <th className="px-4 py-3">Манзил</th>
              <th className="px-4 py-3">Сана</th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((row) => (
              <tr key={row.id} className="border-t border-[#ebdfcb]">
                <td className="px-4 py-3 font-semibold">{row.order_number}</td>
                <td className="px-4 py-3">{formatMoney(Number(row.total ?? 0))}</td>
                <td className="px-4 py-3">{row.status}</td>
                <td className="px-4 py-3">{row.delivery_address ?? "-"}</td>
                <td className="px-4 py-3">{new Date(row.created_at).toLocaleString("uz-UZ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(orders ?? []).length === 0 && <p className="p-4 text-sm text-[#755f46]">Ҳозирча буюртмалар йўқ.</p>}
      </section>
    </AppShell>
  );
}
