import { AppShell } from "@/components/layout/app-shell";
import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isServerOnlyMode } from "@/lib/runtime-mode";
import { formatMoney } from "@/utils/currency";

export default async function SuppliersPage() {
  const serverOnlyMode = isServerOnlyMode();
  let suppliers: Array<{
    id: string;
    company_name: string;
    phone: string;
    current_debt: number;
    total_purchase: number;
    active: boolean;
    created_at: string;
  }> = [];

  if (!serverOnlyMode) {
    await requirePermission("suppliers.view");
    const supabase = await createClient();

    const { data } = await supabase
      .from("suppliers")
      .select("id, company_name, phone, current_debt, total_purchase, active, created_at")
      .order("created_at", { ascending: false })
      .limit(40);

    suppliers = (data ?? []) as typeof suppliers;
  }

  return (
    <AppShell>
      <section>
        <h1 className="text-3xl font-black text-[#3e2d1f]">Етказиб берувчилар</h1>
        <p className="mt-2 text-sm text-[#6d5a45]">Поставщик карточкаси ва молиявий қарз ҳолати.</p>
      </section>

      <section className="mt-6 overflow-x-auto rounded-2xl border border-[#d9cab1] bg-[#fffaf0]">
        <table className="min-w-full text-sm">
          <thead className="bg-[#f4e7d1] text-left text-[#5f4a33]">
            <tr>
              <th className="px-4 py-3">Компания</th>
              <th className="px-4 py-3">Телефон</th>
              <th className="px-4 py-3">Қарз</th>
              <th className="px-4 py-3">Умумий харид</th>
              <th className="px-4 py-3">Ҳолат</th>
            </tr>
          </thead>
          <tbody>
            {(suppliers ?? []).map((row) => (
              <tr key={row.id} className="border-t border-[#ebdfcb]">
                <td className="px-4 py-3 font-semibold">{row.company_name}</td>
                <td className="px-4 py-3">{row.phone}</td>
                <td className="px-4 py-3">{formatMoney(Number(row.current_debt ?? 0))}</td>
                <td className="px-4 py-3">{formatMoney(Number(row.total_purchase ?? 0))}</td>
                <td className="px-4 py-3">{row.active ? "Фаол" : "Нофаол"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(suppliers ?? []).length === 0 && <p className="p-4 text-sm text-[#755f46]">Ҳозирча етказиб берувчилар йўқ.</p>}
      </section>
    </AppShell>
  );
}
