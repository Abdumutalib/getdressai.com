import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isServerOnlyMode } from "@/lib/runtime-mode";
import { formatMoney } from "@/utils/currency";

export default async function PaymentsPage() {
  const serverOnlyMode = isServerOnlyMode();
  let payments: Array<{
    id: string;
    entity_type: string;
    amount: number;
    method: string;
    direction: string;
    created_at: string;
  }> = [];

  if (!serverOnlyMode) {
    await requirePermission("payments.view");
    const supabase = await createClient();

    const { data } = await supabase
      .from("payments")
      .select("id, entity_type, amount, method, direction, created_at")
      .order("created_at", { ascending: false })
      .limit(30);

    payments = (data ?? []) as typeof payments;
  }

  return (
    <AppShell>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#3e2d1f]">Тўловлар</h1>
          <p className="mt-2 text-sm text-[#6d5a45]">Мижоз ва етказиб берувчи тўлов ҳаракати.</p>
        </div>
        <Link href="/payments/new" className="rounded-xl bg-[#6b4f33] px-4 py-2 text-sm font-semibold text-white">Янги тўлов</Link>
      </section>

      <section className="mt-6 overflow-x-auto rounded-2xl border border-[#d9cab1] bg-[#fffaf0]">
        <table className="min-w-full text-sm">
          <thead className="bg-[#f4e7d1] text-left text-[#5f4a33]">
            <tr>
              <th className="px-4 py-3">Томон</th>
              <th className="px-4 py-3">Йўналиш</th>
              <th className="px-4 py-3">Усул</th>
              <th className="px-4 py-3">Сумма</th>
              <th className="px-4 py-3">Сана</th>
            </tr>
          </thead>
          <tbody>
            {(payments ?? []).map((row) => (
              <tr key={row.id} className="border-t border-[#ebdfcb]">
                <td className="px-4 py-3">{row.entity_type}</td>
                <td className="px-4 py-3">{row.direction}</td>
                <td className="px-4 py-3">{row.method}</td>
                <td className="px-4 py-3">{formatMoney(Number(row.amount ?? 0))}</td>
                <td className="px-4 py-3">{new Date(row.created_at).toLocaleString("uz-UZ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(payments ?? []).length === 0 && <p className="p-4 text-sm text-[#755f46]">Ҳозирча тўловлар йўқ.</p>}
      </section>
    </AppShell>
  );
}
