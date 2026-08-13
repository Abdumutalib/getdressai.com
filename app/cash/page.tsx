import { AppShell } from "@/components/layout/app-shell";
import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isServerOnlyMode } from "@/lib/runtime-mode";
import { formatMoney } from "@/utils/currency";

export default async function CashPage() {
  const serverOnlyMode = isServerOnlyMode();
  let accounts: Array<{ id: string; name: string; type: string; balance: number; active: boolean }> = [];
  let txs: Array<{ id: string; type: string; amount: number; source: string | null; comment: string | null; created_at: string }> = [];

  if (!serverOnlyMode) {
    await requirePermission("cash.view");
    const supabase = await createClient();

    const [accountsRes, txsRes] = await Promise.all([
      supabase.from("cash_accounts").select("id, name, type, balance, active").order("created_at", { ascending: false }).limit(20),
      supabase
        .from("cash_transactions")
        .select("id, type, amount, source, comment, created_at")
        .order("created_at", { ascending: false })
        .limit(30),
    ]);

    accounts = (accountsRes.data ?? []) as typeof accounts;
    txs = (txsRes.data ?? []) as typeof txs;
  }

  return (
    <AppShell>
      <section>
        <h1 className="text-3xl font-black text-[#3e2d1f]">Касса</h1>
        <p className="mt-2 text-sm text-[#6d5a45]">Ҳисобрақам баланси ва тушум/чиқим операциялари.</p>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {(accounts ?? []).map((account) => (
          <article key={account.id} className="rounded-2xl border border-[#dbcdb6] bg-[#fffaf0] p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#8b6e4f]">{account.type}</p>
            <p className="mt-1 text-base font-extrabold text-[#3d2d1f]">{account.name}</p>
            <p className="mt-2 text-lg font-black text-[#3d2d1f]">{formatMoney(Number(account.balance ?? 0))}</p>
          </article>
        ))}
        {(accounts ?? []).length === 0 && <p className="text-sm text-[#755f46]">Касса ҳисоблари топилмади.</p>}
      </section>

      <section className="mt-6 overflow-x-auto rounded-2xl border border-[#d9cab1] bg-[#fffaf0]">
        <table className="min-w-full text-sm">
          <thead className="bg-[#f4e7d1] text-left text-[#5f4a33]">
            <tr>
              <th className="px-4 py-3">Тур</th>
              <th className="px-4 py-3">Сумма</th>
              <th className="px-4 py-3">Манба</th>
              <th className="px-4 py-3">Изоҳ</th>
              <th className="px-4 py-3">Сана</th>
            </tr>
          </thead>
          <tbody>
            {(txs ?? []).map((row) => (
              <tr key={row.id} className="border-t border-[#ebdfcb]">
                <td className="px-4 py-3">{row.type}</td>
                <td className="px-4 py-3 font-semibold">{formatMoney(Number(row.amount ?? 0))}</td>
                <td className="px-4 py-3">{row.source ?? "-"}</td>
                <td className="px-4 py-3">{row.comment ?? "-"}</td>
                <td className="px-4 py-3">{new Date(row.created_at).toLocaleString("uz-UZ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AppShell>
  );
}
