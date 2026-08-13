import { AppShell } from "@/components/layout/app-shell";
import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isServerOnlyMode } from "@/lib/runtime-mode";
import { formatMoney } from "@/utils/currency";

export default async function DeliveryPage() {
  const serverOnlyMode = isServerOnlyMode();
  let deliveries: Array<{
    id: string;
    delivery_address: string;
    amount: number;
    payment_status: string;
    status: string;
    created_at: string;
  }> = [];

  if (!serverOnlyMode) {
    await requirePermission("delivery.view");
    const supabase = await createClient();

    const { data } = await supabase
      .from("deliveries")
      .select("id, delivery_address, amount, payment_status, status, created_at")
      .order("created_at", { ascending: false })
      .limit(30);

    deliveries = (data ?? []) as typeof deliveries;
  }

  return (
    <AppShell>
      <section>
        <h1 className="text-3xl font-black text-[#3e2d1f]">Етказиб бериш</h1>
        <p className="mt-2 text-sm text-[#6d5a45]">Курьер пайплайни ва етказма статус мониторинги.</p>
      </section>

      <section className="mt-6 overflow-x-auto rounded-2xl border border-[#d9cab1] bg-[#fffaf0]">
        <table className="min-w-full text-sm">
          <thead className="bg-[#f4e7d1] text-left text-[#5f4a33]">
            <tr>
              <th className="px-4 py-3">Манзил</th>
              <th className="px-4 py-3">Сумма</th>
              <th className="px-4 py-3">Тўлов</th>
              <th className="px-4 py-3">Статус</th>
              <th className="px-4 py-3">Сана</th>
            </tr>
          </thead>
          <tbody>
            {(deliveries ?? []).map((row) => (
              <tr key={row.id} className="border-t border-[#ebdfcb]">
                <td className="px-4 py-3">{row.delivery_address}</td>
                <td className="px-4 py-3">{formatMoney(Number(row.amount ?? 0))}</td>
                <td className="px-4 py-3">{row.payment_status}</td>
                <td className="px-4 py-3">{row.status}</td>
                <td className="px-4 py-3">{new Date(row.created_at).toLocaleString("uz-UZ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(deliveries ?? []).length === 0 && <p className="p-4 text-sm text-[#755f46]">Ҳозирча етказмалар йўқ.</p>}
      </section>
    </AppShell>
  );
}
