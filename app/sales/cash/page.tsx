import { AppShell } from "@/components/layout/app-shell";
import { SaleForm } from "@/features/transactions/sale-form";

export default function CashSalesPage() {
  return (
    <AppShell>
      <section>
        <h1 className="text-3xl font-black text-[#3e2d1f]">Нақд сотув</h1>
        <p className="mt-2 text-sm text-[#6d5a45]">Customerсиз тезкор сотув операциялари.</p>
      </section>

      <section className="mt-6">
        <SaleForm cashSale />
      </section>
    </AppShell>
  );
}
