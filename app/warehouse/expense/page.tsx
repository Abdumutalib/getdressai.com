import { AppShell } from "@/components/layout/app-shell";
import { WarehouseExpenseForm } from "@/features/warehouse/warehouse-expense-form";

export default function WarehouseExpensePage() {
  return (
    <AppShell>
      <section>
        <h1 className="text-3xl font-black text-[#3e2d1f]">Омбор чиқими</h1>
        <p className="mt-2 text-sm text-[#6d5a45]">Товарни чиқариш, бузилган маҳсулот ва ички фойдаланиш.</p>
      </section>

      <section className="mt-6">
        <WarehouseExpenseForm />
      </section>
    </AppShell>
  );
}
