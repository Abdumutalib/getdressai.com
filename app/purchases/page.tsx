import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isServerOnlyMode } from "@/lib/runtime-mode";
import { formatMoney } from "@/utils/currency";

export default async function PurchasesPage() {
  const serverOnlyMode = isServerOnlyMode();
  let purchases: Array<{
    id: string;
    purchase_number: string;
    total: number;
    paid_amount: number;
    debt_amount: number;
    status: string;
    created_at: string;
  }> = [];

  if (!serverOnlyMode) {
    await requirePermission("purchases.view");
    const supabase = await createClient();

    const { data } = await supabase
      .from("purchases")
      .select("id, purchase_number, total, paid_amount, debt_amount, status, created_at")
      .order("created_at", { ascending: false })
      .limit(30);

    purchases = (data ?? []) as typeof purchases;
  }

  return (
    <AppShell>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#3e2d1f]">Харидлар</h1>
          <p className="mt-2 text-sm text-[#6d5a45]">Кирим операциялари ва етказиб берувчи қарзлари.</p>
        </div>
        <Link href="/purchases/new" className="rounded-xl bg-[#6b4f33] px-4 py-2 text-sm font-semibold text-white">Янги харид</Link>
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
            {(purchases ?? []).map((row) => (
              <tr key={row.id} className="border-t border-[#ebdfcb]">
                <td className="px-4 py-3 font-semibold">{row.purchase_number}</td>
                <td className="px-4 py-3">{formatMoney(Number(row.total ?? 0))}</td>
                <td className="px-4 py-3">{formatMoney(Number(row.paid_amount ?? 0))}</td>
                <td className="px-4 py-3">{formatMoney(Number(row.debt_amount ?? 0))}</td>
                <td className="px-4 py-3">{row.status}</td>
                <td className="px-4 py-3">{new Date(row.created_at).toLocaleString("uz-UZ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(purchases ?? []).length === 0 && <p className="p-4 text-sm text-[#755f46]">Ҳозирча харидлар йўқ.</p>}
      </section>
    </AppShell>
  );
}
