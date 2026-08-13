import { AppShell } from "@/components/layout/app-shell";
import { PurchaseForm } from "@/features/transactions/purchase-form";

export default function NewPurchasePage() {
  return (
    <AppShell>
      <section>
        <h1 className="text-3xl font-black text-[#3e2d1f]">Янги кирим</h1>
        <p className="mt-2 text-sm text-[#6d5a45]">Supplier → Purchase → Stock Increase → Supplier Balance.</p>
      </section>

      <section className="mt-6">
        <PurchaseForm />
      </section>
    </AppShell>
  );
}
