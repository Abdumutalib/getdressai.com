import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isServerOnlyMode } from "@/lib/runtime-mode";
import { formatMoney } from "@/utils/currency";

export default async function ExpensesPage() {
  const serverOnlyMode = isServerOnlyMode();
  let expenses: Array<{
    id: string;
    amount: number;
    comment: string | null;
    created_at: string;
  }> = [];

  if (!serverOnlyMode) {
    await requirePermission("expenses.view");
    const supabase = await createClient();

    const { data } = await supabase
      .from("expenses")
      .select("id, amount, comment, created_at")
      .order("created_at", { ascending: false })
      .limit(30);

    expenses = (data ?? []) as typeof expenses;
  }

  return (
    <AppShell>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#3e2d1f]">Харажатлар</h1>
          <p className="mt-2 text-sm text-[#6d5a45]">Касса харажатлари ва омбор чиқимлари мониторинги.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/expenses/new" className="rounded-xl bg-[#6b4f33] px-4 py-2 text-sm font-semibold text-white">Янги харажат</Link>
          <Link href="/warehouse/expense" className="rounded-xl bg-[#f4e7d1] px-4 py-2 text-sm font-semibold text-[#4a3725]">Омбор чиқими</Link>
        </div>
      </section>

      <section className="mt-6 overflow-x-auto rounded-2xl border border-[#d9cab1] bg-[#fffaf0]">
        <table className="min-w-full text-sm">
          <thead className="bg-[#f4e7d1] text-left text-[#5f4a33]">
            <tr>
              <th className="px-4 py-3">Сумма</th>
              <th className="px-4 py-3">Изоҳ</th>
              <th className="px-4 py-3">Сана</th>
            </tr>
          </thead>
          <tbody>
            {(expenses ?? []).map((row) => (
              <tr key={row.id} className="border-t border-[#ebdfcb]">
                <td className="px-4 py-3 font-semibold">{formatMoney(Number(row.amount ?? 0))}</td>
                <td className="px-4 py-3">{row.comment ?? "-"}</td>
                <td className="px-4 py-3">{new Date(row.created_at).toLocaleString("uz-UZ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(expenses ?? []).length === 0 && <p className="p-4 text-sm text-[#755f46]">Ҳозирча харажатлар йўқ.</p>}
      </section>
    </AppShell>
  );
}
