import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isServerOnlyMode } from "@/lib/runtime-mode";
import { formatMoney } from "@/utils/currency";

export default async function SalesPage() {
  const serverOnlyMode = isServerOnlyMode();
  let sales: Array<{
    id: string;
    invoice_number: string;
    total: number;
    paid_amount: number;
    debt_amount: number;
    status: string;
    created_at: string;
  }> = [];

  if (!serverOnlyMode) {
    await requirePermission("sales.view");
    const supabase = await createClient();
    const { data } = await supabase
      .from("sales")
      .select("id, invoice_number, total, paid_amount, debt_amount, status, created_at")
      .order("created_at", { ascending: false })
      .limit(30);
    sales = (data ?? []) as typeof sales;
  }

  return (
    <AppShell>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#3e2d1f]">Сотувлар</h1>
          <p className="mt-2 text-sm text-[#6d5a45]">Савдо операциялари, қарз ва тўлов ҳолати.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/sales/new" className="rounded-xl bg-[#6b4f33] px-4 py-2 text-sm font-semibold text-white">Янги сотув</Link>
          <Link href="/sales/cash" className="rounded-xl bg-[#f4e7d1] px-4 py-2 text-sm font-semibold text-[#4a3725]">Тезкор нақд сотув</Link>
        </div>
      </section>

      <section className="mt-6 overflow-x-auto rounded-2xl border border-[#d9cab1] bg-[#fffaf0]">
        <table className="min-w-full text-sm">
          <thead className="bg-[#f4e7d1] text-left text-[#5f4a33]">
            <tr>
              <th className="px-4 py-3">Ҳужжат</th>
              <th className="px-4 py-3">Жами</th>
              <th className="px-4 py-3">Тўланган</th>
              <th className="px-4 py-3">Қарз</th>
              <th className="px-4 py-3">Ҳолат</th>
              <th className="px-4 py-3">Сана</th>
            </tr>
          </thead>
          <tbody>
            {(sales ?? []).map((row) => (
              <tr key={row.id} className="border-t border-[#ebdfcb]">
                <td className="px-4 py-3 font-semibold">{row.invoice_number}</td>
                <td className="px-4 py-3">{formatMoney(Number(row.total ?? 0))}</td>
                <td className="px-4 py-3">{formatMoney(Number(row.paid_amount ?? 0))}</td>
                <td className="px-4 py-3">{formatMoney(Number(row.debt_amount ?? 0))}</td>
                <td className="px-4 py-3">{row.status}</td>
                <td className="px-4 py-3">{new Date(row.created_at).toLocaleString("uz-UZ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(sales ?? []).length === 0 && <p className="p-4 text-sm text-[#755f46]">Ҳозирча сотувлар йўқ.</p>}
      </section>
    </AppShell>
  );
}
